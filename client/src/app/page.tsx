"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  askQuestion,
  deleteDocument,
  getAiQueryStats,
  getDocumentPreview,
  getDocuments,
  uploadDocument,
} from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DocumentItem {
  id: string;
  name: string;
  file_type: string;
  status: string;
  page_count: number;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

interface Citation {
  documentId: string;
  documentName: string;
  pageNumber: number;
  similarity: number;
}

interface PreviewDocument {
  id: string;
  name: string;
  fileType: string;
  previewUrl: string;
}

export default function Home() {
  const [status, setStatus] = useState("Checking API...");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const [deletingDocumentId, setDeletingDocumentId] =
    useState<string | null>(null);

  const [previewDocument, setPreviewDocument] =
    useState<PreviewDocument | null>(null);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [aiQueryCount, setAiQueryCount] = useState(0);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!API_URL) {
      setStatus("Offline");
      return;
    }

    fetch(`${API_URL}/api/health`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("API request failed");
        }

        return res.json();
      })
      .then(() => setStatus("Connected"))
      .catch(() => setStatus("Offline"));
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      const token = localStorage.getItem("token");

      if (!token) {
        setDocumentsLoading(false);
        return;
      }

      try {
        const [documentsData, queryStats] = await Promise.all([
          getDocuments(token),
          getAiQueryStats(token),
        ]);

        setDocuments(documentsData.documents || []);
        setAiQueryCount(queryStats.count || 0);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setDocumentsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setUploadMessage("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setUploadMessage(
        "Please login first. No authentication token found."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      setUploadMessage(
        "Uploading and processing document..."
      );

      await uploadDocument(file, token);

      setUploadMessage(
        "Document uploaded successfully."
      );

      const data = await getDocuments(token);

      setDocuments(data.documents || []);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Document upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleDeleteDocument(
    documentId: string,
    documentName: string
  ) {
    if (deletingDocumentId) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${documentName}"?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setUploadMessage("Please login again.");
      return;
    }

    try {
      setDeletingDocumentId(documentId);

      setUploadMessage(
        `Deleting "${documentName}"...`
      );

      await deleteDocument(
        documentId,
        token
      );

      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (document) => document.id !== documentId
        )
      );

      if (previewDocument?.id === documentId) {
        setPreviewDocument(null);
      }

      setUploadMessage(
        "Document deleted successfully."
      );

      setAnswer("");
      setCitations([]);
    } catch (error) {
      console.error(
        "DELETE DOCUMENT ERROR:",
        error
      );

      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete document."
      );
    } finally {
      setDeletingDocumentId(null);
    }
  }

  async function handlePreviewDocument(
    documentId: string
  ) {
    if (previewLoading) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setPreviewError("Please login again.");
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewError("");
      setPreviewDocument(null);

      const data = await getDocumentPreview(
        documentId,
        token
      );

      setPreviewDocument(data.document);
    } catch (error) {
      console.error(
        "DOCUMENT PREVIEW ERROR:",
        error
      );

      setPreviewError(
        error instanceof Error
          ? error.message
          : "Failed to preview document."
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreview() {
    setPreviewDocument(null);
    setPreviewError("");
  }

  async function handleAskQuestion() {
    if (!question.trim() || asking) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setAskError("Please login again.");
      return;
    }

    try {
      setAsking(true);
      setAskError("");
      setAnswer("");
      setCitations([]);

      const result = await askQuestion(
        question.trim(),
        token
      );

      setAnswer(result.answer || "");
      setCitations(result.citations || []);

      const queryStats =
        await getAiQueryStats(token);

      setAiQueryCount(queryStats.count || 0);
    } catch (error) {
      console.error(
        "ASK QUESTION ERROR:",
        error
      );

      setAskError(
        error instanceof Error
          ? error.message
          : "Failed to answer question"
      );
    } finally {
      setAsking(false);
    }
  }

  function handleQuestionKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAskQuestion();
    }
  }

  const documentCount = documents.length;

  const indexedChunks = documents.reduce(
    (total, document) =>
      total + Number(document.chunk_count || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}

        <aside className="hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">

          <div className="flex h-16 items-center border-b border-slate-200 px-6">
            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                N
              </div>

              <span className="text-lg font-bold">
                Nexora AI
              </span>

            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">

            <button className="flex w-full rounded-lg bg-slate-100 px-3 py-2.5 text-left text-sm font-medium">
              Dashboard
            </button>

            <button className="flex w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50">
              Documents
            </button>

            <button className="flex w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50">
              Search
            </button>

            <button className="flex w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50">
              AI Assistant
            </button>

          </nav>

          <div className="border-t border-slate-200 p-4">

            <p className="text-xs text-slate-500">
              Backend status
            </p>

            <div className="mt-2 flex items-center gap-2">

              <span
                className={`h-2 w-2 rounded-full ${
                  status === "Connected"
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

              <span className="text-sm font-medium">
                {status}
              </span>

            </div>

          </div>

        </aside>

        {/* Main area */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* Header */}

          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">

            <div>

              <h1 className="text-lg font-semibold">
                Dashboard
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Your document intelligence workspace
              </p>

            </div>

            <button
              onClick={openFilePicker}
              disabled={uploading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : "Upload Document"}
            </button>

          </header>

          {/* Hidden file input */}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Content */}

          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">

            {/* Welcome */}

            <section className="mb-8">

              <h2 className="text-2xl font-bold">
                Welcome to Nexora AI
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search, understand, and interact with
                your documents using AI.
              </p>

            </section>

            {/* AI Assistant */}

            <section className="mb-8">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="mb-4">

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                      AI
                    </div>

                    <div>

                      <h3 className="font-semibold">
                        AI Assistant
                      </h3>

                      <p className="text-xs text-slate-500">
                        Ask questions about your uploaded documents
                      </p>

                    </div>

                  </div>

                </div>

                <div className="relative">

                  <input
                    type="text"
                    value={question}
                    onChange={(event) =>
                      setQuestion(event.target.value)
                    }
                    onKeyDown={handleQuestionKeyDown}
                    disabled={asking}
                    placeholder="Ask anything about your documents..."
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white px-5 pr-28 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                  />

                  <button
                    onClick={handleAskQuestion}
                    disabled={
                      asking ||
                      !question.trim()
                    }
                    className="absolute right-2 top-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {asking
                      ? "Thinking..."
                      : "Ask AI"}
                  </button>

                </div>

                {askError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {askError}
                  </div>
                )}

                {answer && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">

                    <div className="mb-3 flex items-center justify-between">

                      <h4 className="text-sm font-semibold text-slate-900">
                        Answer
                      </h4>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                        AI Generated
                      </span>

                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {answer}
                    </p>

                  </div>
                )}

                {citations.length > 0 && (
                  <div className="mt-5">

                    <div className="mb-3 flex items-center justify-between">

                      <h4 className="text-sm font-semibold text-slate-900">
                        Sources
                      </h4>

                      <span className="text-xs text-slate-400">
                        {citations.length} relevant sources
                      </span>

                    </div>

                    <div className="space-y-2">

                      {citations.map(
                        (citation, index) => (
                          <div
                            key={`${citation.documentId}-${citation.pageNumber}-${index}`}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-3"
                          >

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                              <div className="min-w-0">

                                <p className="truncate text-sm font-medium text-slate-800">
                                  {citation.documentName}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  Page{" "}
                                  {citation.pageNumber}
                                </p>

                              </div>

                              <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {(
                                  Number(
                                    citation.similarity
                                  ) * 100
                                ).toFixed(1)}
                                % match
                              </span>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

              </div>

            </section>

            {/* Upload message */}

            {uploadMessage && (
              <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                {uploadMessage}
              </div>
            )}

            {/* Stats */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Documents
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {documentsLoading
                    ? "..."
                    : documentCount}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Uploaded documents
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  AI Queries
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {aiQueryCount}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Questions answered
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Indexed Chunks
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {documentsLoading
                    ? "..."
                    : indexedChunks}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Semantic search chunks
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  System
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {status === "Connected"
                    ? "Online"
                    : "Offline"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  API connection
                </p>

              </div>

            </section>

            {/* Recent Documents */}

            <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                <div>

                  <h3 className="font-semibold">
                    Recent Documents
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Your latest uploaded documents
                  </p>

                </div>

                <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  View all
                </button>

              </div>

              <div className="p-5">

                {documentsLoading ? (

                  <div className="flex min-h-48 items-center justify-center">

                    <p className="text-sm text-slate-500">
                      Loading documents...
                    </p>

                  </div>

                ) : documents.length === 0 ? (

                  <div className="flex min-h-48 items-center justify-center">

                    <div className="text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                        +
                      </div>

                      <h4 className="mt-4 text-sm font-semibold">
                        No documents yet
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Upload your first document to
                        start using Nexora AI.
                      </p>

                      <button
                        onClick={openFilePicker}
                        disabled={uploading}
                        className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        Upload Document
                      </button>

                    </div>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {documents.map((document) => (

                      <div
                        key={document.id}
                        className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div className="min-w-0">

                          <p className="truncate font-medium text-slate-900">
                            {document.name}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">

                            <span>
                              {document.page_count} pages
                            </span>

                            <span>
                              {document.chunk_count} chunks
                            </span>

                            <span>
                              {document.file_type}
                            </span>

                            <span>
                              {new Date(
                                document.created_at
                              ).toLocaleDateString()}
                            </span>

                          </div>

                        </div>

                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                              document.status ===
                              "processed"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {document.status}
                          </span>

                          <button
                            onClick={() =>
                              handlePreviewDocument(
                                document.id
                              )
                            }
                            disabled={
                              previewLoading ||
                              deletingDocumentId ===
                                document.id
                            }
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {previewLoading
                              ? "Opening..."
                              : "View"}
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteDocument(
                                document.id,
                                document.name
                              )
                            }
                            disabled={
                              deletingDocumentId ===
                              document.id
                            }
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingDocumentId ===
                            document.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>

          </main>

        </div>

      </div>

      {/* PDF Preview Modal */}

      {(previewDocument ||
        previewLoading ||
        previewError) && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">

          <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-5">

              <div className="min-w-0">

                <h3 className="truncate text-sm font-semibold text-slate-900">
                  {previewDocument?.name ||
                    "Document Preview"}
                </h3>

                {previewDocument && (
                  <p className="text-xs text-slate-500">
                    Secure temporary preview
                  </p>
                )}

              </div>

              <button
                onClick={closePreview}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>

            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-100">

              {previewLoading && (
                <div className="text-center">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

                  <p className="mt-3 text-sm text-slate-500">
                    Preparing document preview...
                  </p>

                </div>
              )}

              {!previewLoading &&
                previewError && (

                  <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-5 text-center">

                    <h4 className="font-semibold text-red-700">
                      Preview unavailable
                    </h4>

                    <p className="mt-2 text-sm text-red-600">
                      {previewError}
                    </p>

                  </div>
                )}

              {!previewLoading &&
                !previewError &&
                previewDocument && (

                  <iframe
                    src={previewDocument.previewUrl}
                    title={previewDocument.name}
                    className="h-full w-full border-0"
                  />
                )}

            </div>

          </div>

        </div>
      )}

    </main>
  );
}