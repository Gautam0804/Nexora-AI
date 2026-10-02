import { db } from "../config/db";
import { supabase } from "../config/supabase";
import crypto from "crypto";

import { extractPdfText } from "./pdf.service";
import { chunkText } from "./chunk.service";
import { saveDocumentChunks } from "./chunk.repository";

export async function uploadDocument(
  userId: string,
  file: Express.Multer.File
) {
  const fileId = crypto.randomUUID();
  const path = `${userId}/${fileId}-${file.originalname}`;

  try {
    console.log("Uploading file to Supabase...");

    const { error: storageError } = await supabase.storage
      .from("documents")
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (storageError) {
      console.error(
        "SUPABASE STORAGE ERROR:",
        storageError
      );

      throw new Error(storageError.message);
    }

    console.log("Supabase upload successful");

    const result = await db.query(
      `
      INSERT INTO documents
        (
          user_id,
          name,
          file_url,
          file_type,
          status,
          page_count,
          chunk_count
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        name,
        file_type,
        status,
        page_count,
        chunk_count,
        created_at,
        updated_at
      `,
      [
        userId,
        file.originalname,
        path,
        file.mimetype,
        "processing",
        0,
        0,
      ]
    );

    const document = result.rows[0];

    const documentId: string = document.id;

    console.log(
      "Document created:",
      documentId
    );

    let pageCount = 0;
    let chunkCount = 0;

    if (file.mimetype === "application/pdf") {
      console.log("Extracting PDF text...");

      const pdf = await extractPdfText(
        file.buffer
      );

      pageCount = pdf.pages.length;

      console.log(
        `Extracted ${pageCount} pages`
      );

      const allChunks: {
        content: string;
        chunkIndex: number;
        pageNumber: number;
      }[] = [];

      let globalChunkIndex = 0;

      for (const page of pdf.pages) {
        const pageChunks = chunkText(
          page.text,
          page.pageNumber
        );

        for (const chunk of pageChunks) {
          allChunks.push({
            content: chunk.content,
            chunkIndex: globalChunkIndex,
            pageNumber: chunk.pageNumber,
          });

          globalChunkIndex++;
        }
      }

      chunkCount = allChunks.length;

      console.log(
        `Created ${chunkCount} chunks`
      );

      await saveDocumentChunks(
        documentId,
        allChunks
      );

      console.log(
        "Document chunks saved successfully"
      );
    }

    const updated = await db.query(
      `
      UPDATE documents
      SET
        status = 'processed',
        page_count = $2,
        chunk_count = $3,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        name,
        file_type,
        status,
        page_count,
        chunk_count,
        created_at,
        updated_at
      `,
      [
        documentId,
        pageCount,
        chunkCount,
      ]
    );

    console.log(
      "Document processing completed"
    );

    return updated.rows[0];

  } catch (error) {
    console.error(
      "DOCUMENT PROCESSING ERROR:",
      error
    );

    /*
     * The document ID is only available after
     * the database INSERT succeeds.
     *
     * We therefore look up the most recently
     * created processing document for this user
     * and file path before marking it failed.
     */
    try {
      const failedDocument = await db.query(
        `
        SELECT id
        FROM documents
        WHERE user_id = $1
          AND file_url = $2
          AND status = 'processing'
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [
          userId,
          path,
        ]
      );

      if (failedDocument.rows.length > 0) {
        const failedDocumentId =
          failedDocument.rows[0].id;

        await db.query(
          `
          UPDATE documents
          SET
            status = 'failed',
            updated_at = NOW()
          WHERE id = $1
          `,
          [failedDocumentId]
        );

        console.log(
          `Document ${failedDocumentId} marked as failed`
        );
      }
    } catch (statusError) {
      console.error(
        "FAILED TO UPDATE DOCUMENT STATUS:",
        statusError
      );
    }

    throw error;
  }
}