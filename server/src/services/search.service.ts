import { generateEmbedding } from "./embedding.service";
import { searchDocumentChunks } from "./search.repository";

export async function searchDocuments(
  userId: string,
  query: string,
  limit = 5
) {
  if (!query.trim()) {
    throw new Error("Search query is required");
  }

  const embedding = await generateEmbedding(query);

 const results = await searchDocumentChunks(
  userId,
  embedding,
  limit,
  0.65
);

  return results;
}