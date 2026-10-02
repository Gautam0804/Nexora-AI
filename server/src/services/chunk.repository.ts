import { db } from "../config/db";
import { generateEmbedding } from "./embedding.service";

export async function saveDocumentChunks(
  documentId: string,
  chunks: {
    content: string;
    chunkIndex: number;
    pageNumber: number;
  }[]
) {
  for (const chunk of chunks) {
    console.log(
      `Generating embedding for chunk ${chunk.chunkIndex} (page ${chunk.pageNumber})...`
    );

    const embedding = await generateEmbedding(
      chunk.content
    );

    const vector = `[${embedding.join(",")}]`;

    await db.query(
      `INSERT INTO document_chunks
        (
          document_id,
          content,
          page_number,
          chunk_index,
          embedding
        )
       VALUES ($1, $2, $3, $4, $5::vector)`,
      [
        documentId,
        chunk.content,
        chunk.pageNumber,
        chunk.chunkIndex,
        vector,
      ]
    );

    console.log(
      `Chunk ${chunk.chunkIndex} saved (page ${chunk.pageNumber})`
    );
  }
}