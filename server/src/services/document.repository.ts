import { db } from "../config/db";
import { supabase } from "../config/supabase";

export async function getUserDocuments(userId: string) {
  const result = await db.query(
    `
    SELECT
      d.id,
      d.name,
      d.file_type,
      d.status,
      d.page_count,
      d.chunk_count,
      d.created_at,
      d.updated_at
    FROM documents d
    WHERE d.user_id = $1
    ORDER BY d.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

export async function deleteDocument(
  userId: string,
  documentId: string
) {
  // 1. Verify ownership and get storage path
  const documentResult = await db.query(
    `
    SELECT
      id,
      name,
      file_url
    FROM documents
    WHERE id = $1
      AND user_id = $2
    `,
    [documentId, userId]
  );

  if (documentResult.rows.length === 0) {
    throw new Error("Document not found");
  }

  const document = documentResult.rows[0];

  // 2. Delete file from Supabase Storage
  if (document.file_url) {
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([document.file_url]);

    if (storageError) {
      console.error(
        "SUPABASE STORAGE DELETE ERROR:",
        storageError
      );

      throw new Error(
        "Failed to delete document from storage"
      );
    }
  }

  // 3. Delete database record
  // document_chunks are automatically deleted
  // because of ON DELETE CASCADE.
  const result = await db.query(
    `
    DELETE FROM documents
    WHERE id = $1
      AND user_id = $2
    RETURNING id, name
    `,
    [documentId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error("Document not found");
  }

  return result.rows[0];
}

export async function getDocumentPreview(
  userId: string,
  documentId: string
) {
  // 1. Verify ownership
  const result = await db.query(
    `
    SELECT
      id,
      name,
      file_url,
      file_type
    FROM documents
    WHERE id = $1
      AND user_id = $2
    `,
    [documentId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error("Document not found");
  }

  const document = result.rows[0];

  // 2. Make sure the storage path exists
  if (!document.file_url) {
    throw new Error("Document file is unavailable");
  }

  // 3. Generate temporary signed URL
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(
      document.file_url,
      300
    );

  if (error || !data?.signedUrl) {
    console.error(
      "SUPABASE SIGNED URL ERROR:",
      error
    );

    throw new Error(
      "Failed to generate document preview"
    );
  }

  // 4. Return safe preview information
  return {
    id: document.id,
    name: document.name,
    fileType: document.file_type,
    previewUrl: data.signedUrl,
  };
}