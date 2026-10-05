const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface DocumentItem {
  id: string;
  name: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  page_count?: number;
  chunk_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AiQueryStats {
  count?: number;
  totalQueries?: number;
  total_queries?: number;
  [key: string]: unknown;
}

export interface RagCitation {
  documentId: string;
  documentName: string;
  pageNumber: number;
  similarity: number;
}

export interface RagResponse {
  question?: string;
  documentId?: string | null;
  answer: string;
  citations: RagCitation[];
}

/* -------------------------------------------------------------------------- */
/* Helper                                                                     */
/* -------------------------------------------------------------------------- */

async function parseResponse(response: Response) {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      message: raw,
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Get Documents                                                              */
/* -------------------------------------------------------------------------- */

export async function getDocuments(token: string) {
  const response = await fetch(`${API_URL}/api/documents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Failed to fetch documents (${response.status})`
    );
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Upload Document                                                            */
/* -------------------------------------------------------------------------- */

export async function uploadDocument(
  file: File,
  token: string
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/documents`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await parseResponse(response);

  console.log(
    "========== UPLOAD DEBUG =========="
  );

  console.log("STATUS:", response.status);
  console.log("RESPONSE:", data);
  console.log("FILE:", file.name);
  console.log("===================================");

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Failed to upload document (${response.status})`
    );
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Delete Document                                                            */
/* -------------------------------------------------------------------------- */

export async function deleteDocument(
  documentId: string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/documents/${documentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Failed to delete document (${response.status})`
    );
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* AI Query Statistics                                                        */
/* -------------------------------------------------------------------------- */

export async function getAiQueryStats(
  token: string
): Promise<AiQueryStats> {
  const url = `${API_URL}/api/ai-queries/stats`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await parseResponse(response);

  console.log(
    "========== AI QUERY STATS =========="
  );

  console.log("URL:", url);
  console.log("STATUS:", response.status);
  console.log("RESPONSE:", data);

  console.log(
    "===================================="
  );

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Failed to fetch AI query stats (${response.status})`
    );
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Document Preview                                                           */
/* -------------------------------------------------------------------------- */

export async function getDocumentPreview(
  documentId: string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/documents/${documentId}/preview`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Failed to get document preview (${response.status})`
    );
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Ask Nexora AI                                                              */
/* -------------------------------------------------------------------------- */

export async function askQuestion(
  question: string,
  token: string,
  documentId?: string
): Promise<RagResponse> {
  const response = await fetch(
    `${API_URL}/api/rag/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        documentId: documentId || undefined,
      }),
    }
  );

  const data = await parseResponse(response);

  console.log(
    "========== RAG DEBUG =========="
  );

  console.log("STATUS:", response.status);
  console.log("RESPONSE:", data);
  console.log("QUESTION:", question);
  console.log(
    "DOCUMENT ID:",
    documentId || "ALL DOCUMENTS"
  );

  console.log(
    "================================"
  );

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Failed to answer question (${response.status})`
    );
  }

  return data;
}

export interface Conversation {
  id: string;
  user_id: string;
  document_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  citations: Array<{
    documentId: string;
    documentName: string;
    pageNumber: number;
    similarity: number;
  }>;
  created_at: string;
}

export interface ConversationWithMessages {
  conversation: Conversation;
  messages: ConversationMessage[];
}

export interface SendConversationMessageResponse {
  conversation: Conversation;
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
  answer: string;
  citations: ConversationMessage["citations"];
}

async function conversationRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}/api/conversations${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message || `Conversation request failed: ${response.status}`
    );
  }

  return data;
}

export async function getConversations(
  token: string
): Promise<{ conversations: Conversation[] }> {
  return conversationRequest("/" , token);
}

export async function createConversation(
  token: string,
  documentId?: string,
  title = "New conversation"
): Promise<{ conversation: Conversation }> {
  return conversationRequest("/", token, {
    method: "POST",
    body: JSON.stringify({
      documentId: documentId || undefined,
      title,
    }),
  });
}

export async function getConversation(
  conversationId: string,
  token: string
): Promise<ConversationWithMessages> {
  return conversationRequest(`/${conversationId}`, token);
}

export async function sendConversationMessage(
  conversationId: string,
  question: string,
  token: string
): Promise<SendConversationMessageResponse> {
  return conversationRequest(`/${conversationId}/messages`, token, {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

export async function renameConversation(
  conversationId: string,
  title: string,
  token: string
): Promise<{ conversation: Conversation }> {
  return conversationRequest(`/${conversationId}`, token, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversation(
  conversationId: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  return conversationRequest(`/${conversationId}`, token, {
    method: "DELETE",
  });
}