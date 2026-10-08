import { generateEmbedding } from "./embedding.service";

import {
  searchDocumentChunks,
  getDocumentChunks,
  getAllUserDocumentChunks,
  searchDocumentContent,
} from "./search.repository";

import { generateAnswer } from "./llm.service";

import { saveAiQuery } from "./query.repository";

import { db } from "../config/db";

/* ==========================================================================
   Types
   ========================================================================== */

interface RagCitation {
  documentId: string;
  documentName: string;
  pageNumber: number;
  similarity: number;
}

interface DocumentChunk {
  id: string;
  document_id: string;
  document_name: string;
  content: string;
  page_number: number;
  chunk_index: number;
  similarity?: number;
}

/**
 * Conversation messages supplied by conversation.service.ts.
 *
 * These messages are NOT treated as factual sources.
 * They are used only to understand follow-up questions.
 */
export interface ConversationHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

type RagIntent =
  | "summary"
  | "key_points"
  | "dates"
  | "exact_search"
  | "general";

/* ==========================================================================
   MAIN RAG FUNCTION
   ========================================================================== */

export async function answerQuestion(
  userId: string,
  question: string,
  documentId?: string,
  conversationHistory: ConversationHistoryMessage[] = []
) {
  const cleanQuestion = question.trim();

  if (!cleanQuestion) {
    throw new Error("Question is required");
  }

  /* ------------------------------------------------------------------------
     Verify selected document
     ------------------------------------------------------------------------ */

  if (documentId) {
    console.log(
      "VERIFYING DOCUMENT:",
      documentId
    );

    const documentResult = await db.query(
      "SELECT id, name FROM documents WHERE id = $1 AND user_id = $2 LIMIT 1",
      [
        documentId,
        userId,
      ]
    );

    if (documentResult.rows.length === 0) {
      throw new Error("Document not found");
    }

    console.log(
      "RAG DOCUMENT VERIFIED:",
      documentResult.rows[0].name
    );
  }

  /* ------------------------------------------------------------------------
     Save query
     ------------------------------------------------------------------------ */

  await saveAiQuery(
    userId,
    cleanQuestion
  );

  console.log(
    "RAG QUESTION:",
    cleanQuestion
  );

  console.log(
    "RAG DOCUMENT:",
    documentId ?? "ALL DOCUMENTS"
  );

  console.log(
    "RAG CONVERSATION HISTORY:",
    conversationHistory.length
  );

  /* ------------------------------------------------------------------------
     Detect intent
     ------------------------------------------------------------------------ */

  const intent = detectIntent(
    cleanQuestion
  );

  console.log(
    "RAG INTENT:",
    intent
  );

  /* ------------------------------------------------------------------------
     Whole document summary
     ------------------------------------------------------------------------ */

  if (intent === "summary") {
    if (!documentId) {
      return {
        answer:
          "Please select a document before asking me to summarize it.",
        citations: [],
      };
    }

    return summarizeDocument(
      userId,
      documentId
    );
  }

  /* ------------------------------------------------------------------------
     Whole document key points
     ------------------------------------------------------------------------ */

  if (intent === "key_points") {
    if (!documentId) {
      return {
        answer:
          "Please select a document before asking for its key points.",
        citations: [],
      };
    }

    return extractKeyPoints(
      userId,
      documentId
    );
  }

  /* ------------------------------------------------------------------------
     Dates
     ------------------------------------------------------------------------ */

  if (intent === "dates") {
    return findImportantDates(
      userId,
      documentId
    );
  }

  /* ------------------------------------------------------------------------
     Exact search
     ------------------------------------------------------------------------ */

  if (intent === "exact_search") {
    return exactSearch(
      userId,
      cleanQuestion,
      documentId
    );
  }

  /* ------------------------------------------------------------------------
     Normal semantic RAG
     ------------------------------------------------------------------------ */

  return answerNormalQuestion(
    userId,
    cleanQuestion,
    documentId,
    conversationHistory
  );
}

/* ==========================================================================
   INTENT DETECTION
   ========================================================================== */

function detectIntent(
  question: string
): RagIntent {
  const q = question
    .toLowerCase()
    .trim();

  /* ------------------------------------------------------------------------
     Summary
     ------------------------------------------------------------------------ */

  if (
    q.includes("summarize") ||
    q.includes("summarise") ||
    q.includes("summary") ||
    q.includes("overview") ||
    q.includes(
      "what is this document about"
    ) ||
    q.includes(
      "explain this document"
    )
  ) {
    return "summary";
  }

  /* ------------------------------------------------------------------------
     Key points
     ------------------------------------------------------------------------ */

  if (
    q.includes("key points") ||
    q.includes("key point") ||
    q.includes("main points") ||
    q.includes("important points") ||
    q.includes("main things") ||
    q.includes("main takeaways") ||
    q.includes("key takeaways") ||
    q.includes("takeaways") ||
    q.includes("important things")
  ) {
    return "key_points";
  }

  /* ------------------------------------------------------------------------
     All dates / deadlines
     ------------------------------------------------------------------------ */

  if (
    q.includes("find dates") ||
    q.includes("find the dates") ||
    q.includes("important dates") ||
    q.includes("all dates") ||
    q.includes("dates in this document") ||
    q.includes("what are the dates") ||
    q.includes("deadline") ||
    q.includes("deadlines") ||
    q.includes("last date") ||
    q.includes("closing date") ||
    q.includes("application date") ||
    q.includes("registration date") ||
    q.includes("submission date") ||
    q.includes("interview date") ||
    q.includes("exam date") ||
    q.includes("joining date")
  ) {
    return "dates";
  }

  /* ------------------------------------------------------------------------
     Explicit exact search
     ------------------------------------------------------------------------ */

  if (
    q.startsWith("search ") ||
    q.startsWith("find ") ||
    q.startsWith("show ") ||
    q.startsWith("look for ") ||
    q.startsWith("where is ") ||
    q.startsWith("where are ") ||
    q.includes("search for ") ||
    q.includes("find all ")
  ) {
    return "exact_search";
  }

  /*
   * If a question directly contains a month,
   * year, or explicit date, treat it as an exact
   * document search.
   */

  if (
    containsExplicitDateToken(q)
  ) {
    return "exact_search";
  }

  return "general";
}

/* ==========================================================================
   DATE TOKEN DETECTION
   ========================================================================== */

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function containsExplicitDateToken(
  question: string
): boolean {
  const q = question.toLowerCase();

  /* 10 October 2026 */

  const fullDatePattern =
    /\b\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i;

  /* October 2026 */

  const monthYearPattern =
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i;

  /* 10/10/2026 */

  const numericDatePattern =
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/;

  /* 2026 */

  const yearPattern =
    /\b(19|20)\d{2}\b/;

  /* January */

  const monthPattern =
    new RegExp(
      `\\b(${MONTHS.join("|")})\\b`,
      "i"
    );

  return (
    fullDatePattern.test(q) ||
    monthYearPattern.test(q) ||
    numericDatePattern.test(q) ||
    yearPattern.test(q) ||
    monthPattern.test(q)
  );
}

/* ==========================================================================
   NORMAL SEMANTIC RAG
   ========================================================================== */

async function answerNormalQuestion(
  userId: string,
  question: string,
  documentId?: string,
  conversationHistory: ConversationHistoryMessage[] = []
) {
  console.time("TOTAL RAG");

  /* ------------------------------------------------------------------------
     Generate embedding
     ------------------------------------------------------------------------ */

  console.time("EMBEDDING");

  const embedding =
    await generateEmbedding(question);

  console.timeEnd("EMBEDDING");

  console.log(
    "QUESTION EMBEDDING DIMENSIONS:",
    embedding.length
  );

  /* ------------------------------------------------------------------------
     Vector search
     ------------------------------------------------------------------------ */

  console.time("VECTOR SEARCH");

  const chunks =
    await searchDocumentChunks(
      userId,
      embedding,
      5,
      0.45,
      documentId
    );

  console.timeEnd("VECTOR SEARCH");

  console.log(
    "RAG RETRIEVED CHUNKS:",
    chunks.length
  );

  if (chunks.length === 0) {
    console.timeEnd("TOTAL RAG");

    return {
      answer: documentId
        ? "The selected document does not contain enough information to answer this question."
        : "Your documents do not contain enough information to answer this question.",
      citations: [],
    };
  }

  /* ------------------------------------------------------------------------
     Build document context
     ------------------------------------------------------------------------ */

  const context =
    buildChunkContext(chunks);

  console.log(
    "RAG CONTEXT LENGTH:",
    context.length
  );

  /* ------------------------------------------------------------------------
     Build conversation history context
     ------------------------------------------------------------------------ */

  const conversationContext =
    buildConversationHistoryContext(
      conversationHistory
    );

  console.log(
    "RAG HISTORY CONTEXT LENGTH:",
    conversationContext.length
  );

  /* ------------------------------------------------------------------------
     LLM prompt
     ------------------------------------------------------------------------ */

  const prompt = `
You are Nexora AI, a precise document
question-answering assistant.

You are answering a user inside an ongoing
conversation.

The document context is the authoritative
source for factual answers.

Conversation history is provided only to
understand the user's current question and
resolve references to earlier messages.

Do NOT treat previous assistant answers as
authoritative facts.

Use the document context to verify factual
claims.

CONVERSATION HISTORY:

${conversationContext}


CURRENT USER QUESTION:

${question}


DOCUMENT CONTEXT:

${context}


IMPORTANT SOURCE PRIORITY:

1. DOCUMENT CONTEXT
   Use this as the factual source.

2. CONVERSATION HISTORY
   Use this only to understand context,
   references, follow-up questions, and
   what the user is referring to.

3. PREVIOUS ASSISTANT RESPONSES
   These are NOT authoritative facts.
   Verify factual information against the
   document context.


FOLLOW-UP QUESTION HANDLING:

- Resolve references such as "it", "that",
  "this", "they", "them", "the first one",
  "the second one", "the above", "the previous",
  "explain more", "tell me more", "what about this",
  and similar references using the conversation
  history.

- If the user asks a follow-up question,
  understand what entity or topic they are
  referring to before answering.

- If the conversation history identifies the
  subject but the document context does not
  contain enough information about it, say that
  the provided document does not contain enough
  information.

- Never invent a missing reference.

- If a reference is genuinely ambiguous, clearly
  state that the question is ambiguous rather than
  guessing.


RULES:

1. Use only information from the document context
   for factual claims.

2. Use conversation history only for conversational
   context and reference resolution.

3. Do not use outside knowledge.

4. Do not invent facts, dates, names, numbers,
   requirements, qualifications, or explanations.

5. Answer exactly what the user asked.

6. Do not mention embeddings.

7. Do not mention vectors.

8. Do not mention retrieval.

9. Do not mention chunks.

10. Do not mention similarity scores.

11. Do not mention internal processing.

12. Preserve exact information from the document
    whenever possible.

13. If the document context does not contain enough
    information, say:

"The provided document does not contain enough
information to answer this question."

14. Do not provide a generic summary unless the
    user asks for a summary.

15. If the user asks about skills, give the
    required skills.

16. If the user asks about requirements, give
    the requirements.

17. If the user asks about eligibility, give
    the eligibility information.

18. If the user asks about salary, give salary
    information.

19. If the user asks about location, give
    location information.

20. If the user asks about application process,
    give application steps.

21. If the user asks about deadlines, give the
    relevant deadlines.

22. If the user asks about dates, give the
    relevant dates.

23. If the user asks about interviews, give
    interview information.

24. When answering a follow-up question, do not
    unnecessarily repeat the entire previous
    answer.

25. If the user asks "why", "how", "explain",
    or "tell me more", answer specifically about
    the referenced subject.

26. If the user asks a comparison involving
    information from the document, compare only
    information supported by the document.

27. If the requested information exists in the
    document but is spread across multiple
    retrieved sections, combine the relevant
    information accurately.

28. Do not claim that information exists in the
    document unless it is actually present in
    the provided document context.


ANSWER:
`;

  /* ------------------------------------------------------------------------
     Generate answer
     ------------------------------------------------------------------------ */

  console.time("LLM");

  const answer =
    await generateAnswer(prompt);

  console.timeEnd("LLM");

  /* ------------------------------------------------------------------------
     Citations
     ------------------------------------------------------------------------ */

  const citations: RagCitation[] =
    chunks.map((chunk) => ({
      documentId:
        chunk.document_id,

      documentName:
        chunk.document_name,

      pageNumber:
        chunk.page_number,

      similarity:
        Number(chunk.similarity),
    }));

  console.log(
    "RAG CITATIONS:",
    citations
  );

  console.timeEnd("TOTAL RAG");

  return {
    answer,
    citations,
  };
}

/* ==========================================================================
   CONVERSATION HISTORY CONTEXT
   ========================================================================== */

function buildConversationHistoryContext(
  history: ConversationHistoryMessage[]
): string {
  if (!history.length) {
    return "No previous conversation.";
  }

  return history
    .slice(-12)
    .map((message, index) => {
      const role =
        message.role === "user"
          ? "USER"
          : "ASSISTANT";

      return `[Previous Message ${index + 1}]
${role}:
${message.content}`;
    })
    .join("\n\n");
}

/* ==========================================================================
   EXACT CONTENT SEARCH
   ========================================================================== */

async function exactSearch(
  userId: string,
  question: string,
  documentId?: string
) {
  console.log(
    "RAG MODE: EXACT DOCUMENT SEARCH"
  );

  const searchTerm =
    extractSearchTerm(question);

  console.log(
    "SEARCH TERM:",
    searchTerm
  );

  if (!searchTerm) {
    return {
      answer:
        "Please specify what you want to search for.",
      citations: [],
    };
  }

  /*
   * First attempt:
   * Search the exact requested content.
   */

  const results =
    await searchDocumentContent(
      userId,
      searchTerm,
      documentId,
      100
    );

  /*
   * Exact date searching should be deterministic.
   */

  if (results.length === 0) {
    return {
      answer: documentId
        ? `No content matching "${searchTerm}" was found in the selected document.`
        : `No content matching "${searchTerm}" was found in your documents.`,
      citations: [],
    };
  }

  /*
   * Return actual matching document content.
   *
   * Do NOT send this through the LLM.
   *
   * This guarantees that all matches are preserved.
   */

  const answer = results
    .map(
      (chunk, index) =>
        `${index + 1}. ${chunk.document_name} — Page ${chunk.page_number}

${chunk.content.trim()}`
    )
    .join("\n\n");

  const citations: RagCitation[] =
    results.map((chunk) => ({
      documentId:
        chunk.document_id,

      documentName:
        chunk.document_name,

      pageNumber:
        chunk.page_number,

      similarity: 1,
    }));

  return {
    answer,
    citations,
  };
}

/* ==========================================================================
   SEARCH TERM EXTRACTION
   ========================================================================== */

function extractSearchTerm(
  question: string
): string {
  let q = question.trim();

  /*
   * Remove:
   * search
   * search for
   * find
   * show
   * look for
   */

  q = q.replace(
    /^(please\s+)?(search|find|show|look for)\s+(for\s+)?/i,
    ""
  );

  /*
   * Remove:
   * where is
   * where are
   */

  q = q.replace(
    /^(where\s+(is|are)\s+)/i,
    ""
  );

  /*
   * Remove:
   * all
   * the
   */

  q = q.replace(
    /^(all|the)\s+/i,
    ""
  );

  /*
   * Remove trailing document phrases.
   */

  q = q.replace(
    /\s+(in this document|in the document|from this document)$/i,
    ""
  );

  return q.trim();
}

/* ==========================================================================
   WHOLE DOCUMENT SUMMARY
   ========================================================================== */

async function summarizeDocument(
  userId: string,
  documentId: string
) {
  console.log(
    "RAG MODE: WHOLE DOCUMENT SUMMARY"
  );

  const chunks =
    await getDocumentChunks(
      userId,
      documentId
    );

  if (chunks.length === 0) {
    return {
      answer:
        "The selected document does not contain enough information to create a summary.",
      citations: [],
    };
  }

  console.log(
    "SUMMARY CHUNKS:",
    chunks.length
  );

  const context =
    buildChunkContext(chunks);

  console.log(
    "SUMMARY CONTEXT LENGTH:",
    context.length
  );

  const prompt = `
You are Nexora AI, a precise document intelligence assistant.

Create a complete summary of the ENTIRE document using ONLY the document content provided below.

Do not use outside knowledge.

Do not invent information.

Do not omit important information.

The answer should cover, when present:

- concise overview
- main purpose/topic
- important facts
- requirements
- skills
- eligibility
- qualifications
- responsibilities
- technologies
- application information
- important events
- names and organizations
- dates
- deadlines
- numbers
- locations
- conditions
- instructions

Preserve important information accurately.

Do not mention:

- embeddings
- vectors
- retrieval
- chunks
- similarity scores
- internal processing

Use this structure:

Summary:

[Clear overview]

Key Information:

- Point
- Point

Requirements:

- Requirement
- Requirement

Skills / Qualifications:

- Skill or qualification

Important Dates / Deadlines:

- Date — What it represents

Other Important Details:

- Detail

Only include a section when relevant information exists.

DOCUMENT:

${context}

FINAL ANSWER:
`;

  console.time("SUMMARY LLM");

  const answer =
    await generateAnswer(prompt);

  console.timeEnd("SUMMARY LLM");

  const citations: RagCitation[] =
    chunks.map((chunk) => ({
      documentId:
        chunk.document_id,

      documentName:
        chunk.document_name,

      pageNumber:
        chunk.page_number,

      similarity: 1,
    }));

  return {
    answer,
    citations,
  };
}

/* ==========================================================================
   WHOLE DOCUMENT KEY POINTS
   ========================================================================== */

async function extractKeyPoints(
  userId: string,
  documentId: string
) {
  console.log(
    "RAG MODE: WHOLE DOCUMENT KEY POINTS"
  );

  const chunks =
    await getDocumentChunks(
      userId,
      documentId
    );

  if (chunks.length === 0) {
    return {
      answer:
        "The selected document does not contain enough information to identify its key points.",
      citations: [],
    };
  }

  console.log(
    "KEY POINT CHUNKS:",
    chunks.length
  );

  const context =
    buildChunkContext(chunks);

  console.log(
    "KEY POINT CONTEXT LENGTH:",
    context.length
  );

  const prompt = `
You are Nexora AI, a precise document intelligence assistant.

Extract ALL important key points from the ENTIRE document below.

Use ONLY the provided document.

Do not use outside knowledge.

Do not invent information.

Do not omit important information.

Extract important:

- main ideas
- facts
- requirements
- eligibility
- qualifications
- responsibilities
- skills
- technologies
- events
- instructions
- numbers
- dates
- deadlines
- locations
- application information
- conditions
- important conclusions
- names and organizations

Remove genuine repetition, but do NOT remove information merely because it appears similar.

Preserve exact dates, numbers, requirements, qualifications, and important names whenever possible.

Return concise, organized bullet points.

DOCUMENT:

${context}

KEY POINTS:
`;

  console.time("KEY POINTS LLM");

  const answer =
    await generateAnswer(prompt);

  console.timeEnd("KEY POINTS LLM");

  const citations: RagCitation[] =
    chunks.map((chunk) => ({
      documentId:
        chunk.document_id,

      documentName:
        chunk.document_name,

      pageNumber:
        chunk.page_number,

      similarity: 1,
    }));

  return {
    answer,
    citations,
  };
}
/* ==========================================================================
   IMPORTANT DATES
   ========================================================================== */

async function findImportantDates(
  userId: string,
  documentId?: string
) {
  console.log(
    "RAG MODE: IMPORTANT DATES"
  );

  const chunks = documentId
    ? await getDocumentChunks(
        userId,
        documentId
      )
    : await getAllUserDocumentChunks(
        userId
      );

  if (chunks.length === 0) {
    return {
      answer: documentId
        ? "The selected document does not contain any information to search for important dates."
        : "Your documents do not contain any information to search for important dates.",
      citations: [],
    };
  }

  const datePatterns = [
    /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,

    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*|\s+)\d{4}\b/gi,

    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,

    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
  ];

  const results: Array<{
    chunk: DocumentChunk;
    dates: string[];
  }> = [];

  for (const chunk of chunks) {
    const dates = new Set<string>();

    for (const pattern of datePatterns) {
      const matches =
        chunk.content.match(pattern) ?? [];

      for (const match of matches) {
        dates.add(match.trim());
      }
    }

    if (dates.size > 0) {
      results.push({
        chunk,
        dates: Array.from(dates),
      });
    }
  }

  if (results.length === 0) {
    return {
      answer: documentId
        ? "I couldn't find any explicit dates in the selected document."
        : "I couldn't find any explicit dates in your documents.",
      citations: [],
    };
  }

  const answer = results
    .map(({ chunk, dates }) => {
      return [
        `### ${chunk.document_name} — Page ${chunk.page_number}`,
        ...dates.map(
          (date) => `- ${date}`
        ),
      ].join("\n");
    })
    .join("\n\n");

  const citations: RagCitation[] =
    results.map(({ chunk }) => ({
      documentId:
        chunk.document_id,

      documentName:
        chunk.document_name,

      pageNumber:
        chunk.page_number,

      similarity: 1,
    }));

  return {
    answer,
    citations,
  };
}
/* ==========================================================================
   CONTEXT BUILDER
   ========================================================================== */

function buildChunkContext(
  chunks: DocumentChunk[]
) {
  return chunks
    .map(
      (chunk, index) =>
        `[Document Section ${index + 1}]
Document: ${chunk.document_name}
Page: ${chunk.page_number}

Content:

${chunk.content}`
    )
    .join("\n\n");
}

/* ==========================================================================
   DATE DETECTION
   ========================================================================== */

function containsDateInformation(
  text: string
): boolean {
  /*
   * 10 October 2026
   */

  const fullDatePattern =
    /\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i;

  /*
   * 10/10/2026
   * 10-10-2026
   */

  const numericDatePattern =
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/;

  /*
   * October 2026
   */

  const monthYearPattern =
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i;

  /*
   * January
   *
   * Important because the user wants month
   * searches even when no year is present.
   */

  const monthPattern =
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i;

  /*
   * 2026
   */

  const yearPattern =
    /\b(19|20)\d{2}\b/;

  return (
    fullDatePattern.test(text) ||
    numericDatePattern.test(text) ||
    monthYearPattern.test(text) ||
    monthPattern.test(text) ||
    yearPattern.test(text)
  );
}