import { db } from "../config/db";

export async function searchDocumentChunks(
  userId: string,
  vector: number[],
  limit: number,
  similarityThreshold = 0.65
) {
  const queryVector = `[${vector.join(",")}]`;

  const result = await db.query(
    `
    SELECT
      dc.id,
      dc.document_id,
      d.name AS document_name,
      dc.content,
      dc.page_number,
      dc.chunk_index,
      1 - (dc.embedding <=> $1::vector) AS similarity
    FROM document_chunks dc
    INNER JOIN documents d
      ON d.id = dc.document_id
    WHERE d.user_id = $2
      AND dc.embedding IS NOT NULL
      AND 1 - (dc.embedding <=> $1::vector) >= $4
    ORDER BY dc.embedding <=> $1::vector
    LIMIT $3
    `,
    [
      queryVector,
      userId,
      limit,
      similarityThreshold,
    ]
  );

  return result.rows;
}