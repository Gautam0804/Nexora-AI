import { db } from "../config/db";

export interface SearchDocumentChunk {
  id: string;
  document_id: string;
  document_name: string;
  content: string;
  page_number: number;
  chunk_index: number;
  similarity?: number;
}

/**
 * ------------------------------------------------------------
 * SEMANTIC / VECTOR SEARCH
 * ------------------------------------------------------------
 *
 * Used for normal natural-language questions such as:
 *
 * - What skills are required?
 * - What is RiskForge?
 * - What is the eligibility?
 * - Explain the application process.
 *
 * This does NOT handle exact keyword/date searches.
 */
export async function searchDocumentChunks(
  userId: string,
  vector: number[],
  limit = 5,
  similarityThreshold = 0.45,
  documentId?: string
): Promise<SearchDocumentChunk[]> {
  if (!vector || vector.length === 0) {
    throw new Error("Query embedding is empty");
  }

  const queryVector = `[${vector.join(",")}]`;

  console.log("SEARCH USER:", userId);
  console.log(
    "SEARCH DOCUMENT:",
    documentId ?? "ALL DOCUMENTS"
  );
  console.log(
    "SEARCH VECTOR DIMENSIONS:",
    vector.length
  );
  console.log("SEARCH LIMIT:", limit);
  console.log(
    "SEARCH THRESHOLD:",
    similarityThreshold
  );

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
        AND (
          $4::uuid IS NULL
          OR dc.document_id = $4::uuid
        )
      ORDER BY dc.embedding <=> $1::vector
      LIMIT $3
    `,
    [
      queryVector,
      userId,
      limit,
      documentId ?? null,
    ]
  );

  console.log(
    "SEARCH RESULTS:",
    result.rows.length
  );

  if (result.rows.length > 0) {
    console.log(
      "SIMILARITIES:",
      result.rows.map((row) =>
        Number(row.similarity).toFixed(4)
      )
    );
  }

  const filteredRows = result.rows.filter(
    (row) =>
      Number(row.similarity) >=
      similarityThreshold
  );

  console.log(
    "RESULTS AFTER THRESHOLD:",
    filteredRows.length
  );

  return filteredRows;
}

/**
 * ------------------------------------------------------------
 * GET ALL CHUNKS FROM ONE DOCUMENT
 * ------------------------------------------------------------
 *
 * Used for:
 *
 * - Full document summary
 * - Full document key points
 * - Full document date extraction
 *
 * This intentionally does NOT use vector similarity.
 */
export async function getDocumentChunks(
  userId: string,
  documentId: string
): Promise<SearchDocumentChunk[]> {
  const result = await db.query(
    `
      SELECT
        dc.id,
        dc.document_id,
        d.name AS document_name,
        dc.content,
        dc.page_number,
        dc.chunk_index
      FROM document_chunks dc
      INNER JOIN documents d
        ON d.id = dc.document_id
      WHERE d.id = $1
        AND d.user_id = $2
      ORDER BY
        dc.page_number ASC,
        dc.chunk_index ASC
    `,
    [
      documentId,
      userId,
    ]
  );

  console.log(
    "DOCUMENT CHUNKS:",
    result.rows.length
  );

  return result.rows;
}

/**
 * ------------------------------------------------------------
 * GET ALL USER DOCUMENT CHUNKS
 * ------------------------------------------------------------
 *
 * Used when the user has not selected a document.
 *
 * Example:
 *
 * Find all dates
 *
 * This allows searching across all of the user's documents.
 */
export async function getAllUserDocumentChunks(
  userId: string
): Promise<SearchDocumentChunk[]> {
  const result = await db.query(
    `
      SELECT
        dc.id,
        dc.document_id,
        d.name AS document_name,
        dc.content,
        dc.page_number,
        dc.chunk_index
      FROM document_chunks dc
      INNER JOIN documents d
        ON d.id = dc.document_id
      WHERE d.user_id = $1
      ORDER BY
        d.name ASC,
        dc.page_number ASC,
        dc.chunk_index ASC
    `,
    [userId]
  );

  console.log(
    "ALL USER DOCUMENT CHUNKS:",
    result.rows.length
  );

  return result.rows;
}

/**
 * ------------------------------------------------------------
 * EXACT CONTENT SEARCH
 * ------------------------------------------------------------
 *
 * Used for:
 *
 * Search RiskForge
 * Search Python
 * Find January
 * Search 2026
 * Find 15 October 2026
 * Search eligibility
 *
 * This intentionally bypasses embeddings.
 *
 * Why?
 *
 * If the user asks for an exact word/date/year,
 * we want EVERY matching occurrence rather than
 * only the top 5 semantic chunks.
 */
export async function searchDocumentContent(
  userId: string,
  searchTerm: string,
  documentId?: string,
  limit = 100
): Promise<SearchDocumentChunk[]> {
  const cleanTerm = searchTerm.trim();

  if (!cleanTerm) {
    return [];
  }

  /*
   * Escape SQL LIKE special characters.
   *
   * % and _ otherwise have wildcard meaning.
   */
  const escapedTerm = cleanTerm
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");

  const pattern = `%${escapedTerm}%`;

  const result = await db.query(
    `
      SELECT
        dc.id,
        dc.document_id,
        d.name AS document_name,
        dc.content,
        dc.page_number,
        dc.chunk_index
      FROM document_chunks dc
      INNER JOIN documents d
        ON d.id = dc.document_id
      WHERE d.user_id = $1
        AND dc.content ILIKE $2 ESCAPE '\\'
        AND (
          $3::uuid IS NULL
          OR dc.document_id = $3::uuid
        )
      ORDER BY
        d.name ASC,
        dc.page_number ASC,
        dc.chunk_index ASC
      LIMIT $4
    `,
    [
      userId,
      pattern,
      documentId ?? null,
      limit,
    ]
  );

  console.log(
    "EXACT SEARCH TERM:",
    cleanTerm
  );

  console.log(
    "EXACT SEARCH RESULTS:",
    result.rows.length
  );

  return result.rows;
}