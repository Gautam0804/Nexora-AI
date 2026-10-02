import { generateEmbedding } from "./embedding.service";
import { searchDocumentChunks } from "./search.repository";
import { generateAnswer } from "./llm.service";
import { saveAiQuery } from "./query.repository";

interface RagCitation {
  documentId: string;
  documentName: string;
  pageNumber: number;
  similarity: number;
}

export async function answerQuestion(
  userId: string,
  question: string
) {
  if (!question.trim()) {
    throw new Error("Question is required");
  }

  // Save AI query
  await saveAiQuery(userId, question.trim());

  // 1. Convert question into embedding
  const embedding = await generateEmbedding(question);

  // 2. Retrieve relevant document chunks
  const chunks = await searchDocumentChunks(
    userId,
    embedding,
    3,
    0.65
  );

  if (chunks.length === 0) {
    return {
      answer:
        "I could not find relevant information in your documents.",
      citations: [],
    };
  }

  // 3. Build context for the LLM
  const context = chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}]
Document: ${chunk.document_name}
Page: ${chunk.page_number}
Content:
${chunk.content}`
    )
    .join("\n\n");

  // 4. Create grounded prompt
  const prompt = `
You are Nexora AI, a precise document question-answering assistant.

Answer the user's question using ONLY the provided document context.

IMPORTANT RULES:

1. Answer exactly what the user asked.
2. Prefer information that directly defines or explains the user's question.
3. Do not combine the main concept with a related variant unless the user explicitly asks about that variant.
4. Do not introduce "Binary Search on Answer", "minimize the maximum", or "maximize the minimum" when the user asks only "What is binary search?"
5. Do not infer additional concepts from loosely related context.
6. Do not invent information.
7. If the context does not contain enough information to answer the question, say:
   "The provided documents do not contain enough information to answer this question."
8. Keep the answer concise: 2-4 sentences.
9. Do not mention Source 1, Source 2, or internal retrieval details.

DOCUMENT CONTEXT:

${context}

USER QUESTION:

${question}

ANSWER:
`;

  // 5. Generate answer with local LLM
  const answer = await generateAnswer(prompt);

  // 6. Prepare citations
  const citations: RagCitation[] = chunks.map(
    (chunk) => ({
      documentId: chunk.document_id,
      documentName: chunk.document_name,
      pageNumber: chunk.page_number,
      similarity: Number(chunk.similarity),
    })
  );

  return {
    answer,
    citations,
  };
}