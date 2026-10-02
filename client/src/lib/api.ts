const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

// ================================
// Upload Document
// ================================

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

  const data = await response.json();

  console.log(
    "UPLOAD DOCUMENT STATUS:",
    response.status
  );

  console.log(
    "UPLOAD DOCUMENT RESPONSE:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data.message || "Document upload failed"
    );
  }

  return data;
}


// ================================
// Get Documents
// ================================

export async function getDocuments(
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/documents`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  console.log(
    "GET DOCUMENTS STATUS:",
    response.status
  );

  console.log(
    "GET DOCUMENTS RESPONSE:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch documents"
    );
  }

  return data;
}


// ================================
// Delete Document
// ================================

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

  const data = await response.json();

  console.log(
    "DELETE DOCUMENT STATUS:",
    response.status
  );

  console.log(
    "DELETE DOCUMENT RESPONSE:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to delete document"
    );
  }

  return data;
}


// ================================
// Ask AI Question
// ================================

export async function askQuestion(
  question: string,
  token: string
) {
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
      }),
    }
  );

  const data = await response.json();

  console.log(
    "ASK QUESTION STATUS:",
    response.status
  );

  console.log(
    "ASK QUESTION RESPONSE:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to answer question"
    );
  }

  return data;
}


// ================================
// AI Query Statistics
// ================================

export async function getAiQueryStats(
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/queries/stats`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  console.log(
    "AI QUERY STATS STATUS:",
    response.status
  );

  console.log(
    "AI QUERY STATS RESPONSE:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch AI query statistics"
    );
  }

  return data;
}


// ================================
// Document Preview
// ================================

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
    }
  );

  const data = await response.json();

  console.log(
    "DOCUMENT PREVIEW STATUS:",
    response.status
  );

  console.log(
    "DOCUMENT PREVIEW RESPONSE:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to generate document preview"
    );
  }

  return data;
}