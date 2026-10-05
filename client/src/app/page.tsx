"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  askQuestion,
  createConversation,
  deleteConversation,
  deleteDocument,
  getAiQueryStats,
  getConversation,
  getConversations,
  getDocumentPreview,
  getDocuments,
  renameConversation,
  sendConversationMessage,
  uploadDocument,
  type Conversation,
  type ConversationMessage,
} from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken")
  );
}

function clearAuthTokens() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("accessToken");
}

function isUnauthorizedError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return message.includes("unauthorized") || message.includes("401");
}

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

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function Icon({
  name,
  size = 18,
  strokeWidth = 1.8,
}: {
  name:
    | "dashboard"
    | "documents"
    | "search"
    | "sparkles"
    | "upload"
    | "arrow"
    | "file"
    | "layers"
    | "activity"
    | "close"
    | "trash"
    | "eye"
    | "menu"
    | "check"
    | "alert"
    | "send"
    | "chevron"
    | "plus"
    | "shield"
    | "external"
    | "message"
    | "edit";
  size?: number;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "documents":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8" />
          <path d="M8 17h6" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3-1.2 4.2L7 8.5l3.8 1.3L12 14l1.2-4.2L17 8.5l-3.8-1.3z" />
          <path d="m19 14-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7z" />
          <path d="m5 14-.6 1.9L2.5 17l1.9.6L5 19.5l.6-1.9 1.9-.6-1.9-.6z" />
        </svg>
      );

    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M5 20h14" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case "file":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      );

    case "layers":
      return (
        <svg {...common}>
          <path d="m12 2 9 5-9 5-9-5z" />
          <path d="m3 12 9 5 9-5" />
          <path d="m3 17 9 5 9-5" />
        </svg>
      );

    case "activity":
      return (
        <svg {...common}>
          <path d="M3 12h4l3-8 4 16 3-8h4" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12" />
          <path d="m18 6-12 12" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="m19 6-1 15H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      );

    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "alert":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      );

    case "send":
      return (
        <svg {...common}>
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5-3.4 8.8-8 10-4.6-1.2-8-5-8-10V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "external":
      return (
        <svg {...common}>
          <path d="M14 4h6v6" />
          <path d="m20 4-9 9" />
          <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
        </svg>
      );

    case "message":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.4 9.4 0 0 1-4.1-.9L3 21l1.9-4.3A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      );

    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const router = useRouter();

  /* ------------------------------------------------------------------------ */
  /* Authentication                                                           */
  /* ------------------------------------------------------------------------ */

  const [authChecking, setAuthChecking] = useState(true);

  /* ------------------------------------------------------------------------ */
  /* Dashboard                                                                */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* One-off Ask Nexora                                                       */
  /* ------------------------------------------------------------------------ */

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");

  const [selectedDocumentId, setSelectedDocumentId] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Persistent conversations                                                 */
  /* ------------------------------------------------------------------------ */

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const [conversationMessages, setConversationMessages] =
    useState<ConversationMessage[]>([]);

  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationSending, setConversationSending] = useState(false);

  const [conversationQuestion, setConversationQuestion] =
    useState("");

  const [conversationError, setConversationError] = useState("");

  const [chatDocumentId, setChatDocumentId] =
    useState<string | null>(null);

  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const [editingConversationId, setEditingConversationId] =
    useState<string | null>(null);

  const [editingConversationTitle, setEditingConversationTitle] =
    useState("");

  const [deletingConversationId, setDeletingConversationId] =
    useState<string | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------------------ */
  /* Authentication guard                                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthChecking(false);
  }, [router]);

  /* ------------------------------------------------------------------------ */
  /* API health                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (authChecking) return;

    if (!API_URL) {
      setStatus("Offline");
      return;
    }

    fetch(`${API_URL}/api/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("API request failed");
        }

        return response.json();
      })
      .then(() => setStatus("Connected"))
      .catch(() => setStatus("Offline"));
  }, [authChecking]);

  /* ------------------------------------------------------------------------ */
  /* Initial dashboard data                                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (authChecking) return;

    async function loadDashboardData() {
      const token = getAuthToken();

      if (!token) {
        router.replace("/login");
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
        if (isUnauthorizedError(error)) {
          clearAuthTokens();
          router.replace("/login");
          return;
        }

        console.error("Failed to load dashboard:", error);
      } finally {
        setDocumentsLoading(false);
      }
    }

    loadDashboardData();
  }, [authChecking, router]);

  /* ------------------------------------------------------------------------ */
  /* Load conversations                                                       */
  /* ------------------------------------------------------------------------ */

  async function loadConversations() {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setConversationsLoading(true);

      const result = await getConversations(token);

      setConversations(result.conversations || []);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthTokens();
        router.replace("/login");
        return;
      }

      console.error("Failed to load conversations:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to load conversations.";

      setConversationError(message);
    } finally {
      setConversationsLoading(false);
    }
  }

  useEffect(() => {
    if (!authChecking) {
      loadConversations();
    }
  }, [authChecking]);

  /* ------------------------------------------------------------------------ */
  /* Auto scroll chat                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const element = chatScrollRef.current;

    if (!element) return;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });
  }, [conversationMessages, conversationSending]);

  /* ------------------------------------------------------------------------ */
  /* Upload                                                                   */
  /* ------------------------------------------------------------------------ */

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadMessage("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setUploadMessage("Uploading and processing document...");

      await uploadDocument(file, token);

      const data = await getDocuments(token);

      setDocuments(data.documents || []);

      setUploadMessage("Document uploaded successfully.");
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthTokens();
        router.replace("/login");
        return;
      }

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

  /* ------------------------------------------------------------------------ */
  /* Delete document                                                          */
  /* ------------------------------------------------------------------------ */

  async function handleDeleteDocument(
    documentId: string,
    documentName: string
  ) {
    if (deletingDocumentId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${documentName}"?`
    );

    if (!confirmed) return;

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setDeletingDocumentId(documentId);
      setUploadMessage(`Deleting "${documentName}"...`);

      await deleteDocument(documentId, token);

      setDocuments((current) =>
        current.filter((document) => document.id !== documentId)
      );

      if (previewDocument?.id === documentId) {
        setPreviewDocument(null);
      }

      if (selectedDocumentId === documentId) {
        setSelectedDocumentId(null);
      }

      if (chatDocumentId === documentId) {
        setChatDocumentId(null);
      }

      setUploadMessage("Document deleted successfully.");
      setAnswer("");
      setCitations([]);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthTokens();
        router.replace("/login");
        return;
      }

      console.error("DELETE DOCUMENT ERROR:", error);

      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete document."
      );
    } finally {
      setDeletingDocumentId(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Document preview                                                         */
  /* ------------------------------------------------------------------------ */

  async function handlePreviewDocument(documentId: string) {
    if (previewLoading) return;

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewError("");
      setPreviewDocument(null);

      const data = await getDocumentPreview(documentId, token);

      setPreviewDocument(data.document);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthTokens();
        router.replace("/login");
        return;
      }

      console.error("DOCUMENT PREVIEW ERROR:", error);

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

  /* ------------------------------------------------------------------------ */
  /* One-off Ask Nexora                                                       */
  /* ------------------------------------------------------------------------ */

  async function handleAskQuestion() {
    if (!question.trim() || asking) return;

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setAsking(true);
      setAskError("");
      setAnswer("");
      setCitations([]);

      const result = await askQuestion(
        question.trim(),
        token,
        selectedDocumentId || undefined
      );

      setAnswer(result.answer || "");
      setCitations(result.citations || []);

      const stats = await getAiQueryStats(token);

      setAiQueryCount(stats.count || 0);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthTokens();
        router.replace("/login");
        return;
      }

      console.error("ASK QUESTION ERROR:", error);

      setAskError(
        error instanceof Error
          ? error.message
          : "Failed to answer question."
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

  /* ------------------------------------------------------------------------ */
  /* Persistent chat                                                          */
  /* ------------------------------------------------------------------------ */

  async function handleCreateConversation(
    documentId = chatDocumentId
  ) {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return null;
    }

    try {
      setConversationError("");

      const result = await createConversation(
        token,
        documentId || undefined,
        "New conversation"
      );

      const conversation = result.conversation;

      setConversations((current) => [
        conversation,
        ...current.filter(
          (item) => item.id !== conversation.id
        ),
      ]);

      setActiveConversationId(conversation.id);
      setActiveConversation(conversation);
      setConversationMessages([]);
      setConversationQuestion("");
      setMobileHistoryOpen(false);

      return conversation;
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthTokens();
        router.replace("/login");
        return;
      }

      console.error("CREATE CONVERSATION ERROR:", error);

      setConversationError(
        error instanceof Error
          ? error.message
          : "Failed to create conversation."
      );

      return null;
    }
  }

  async function handleSelectConversation(
    conversationId: string
  ) {
    if (conversationId === activeConversationId) {
      setMobileHistoryOpen(false);
      return;
    }

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setConversationLoading(true);
      setConversationError("");

      const result = await getConversation(
        conversationId,
        token
      );

      setActiveConversationId(
        result.conversation.id
      );

      setActiveConversation(
        result.conversation
      );

      setConversationMessages(
        result.messages || []
      );

      setChatDocumentId(
        result.conversation.document_id
      );

      setMobileHistoryOpen(false);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthTokens();
        router.replace("/login");
        return;
      }

      console.error(
        "LOAD CONVERSATION ERROR:",
        error
      );

      setConversationError(
        error instanceof Error
          ? error.message
          : "Failed to load conversation."
      );
    } finally {
      setConversationLoading(false);
    }
  }

  async function handleSendConversationMessage() {
    const cleanQuestion =
      conversationQuestion.trim();

    if (!cleanQuestion || conversationSending) {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setConversationSending(true);
      setConversationError("");

      let conversationId =
        activeConversationId;

      let conversation = activeConversation;

      /*
       * Automatically create a conversation if the user
       * starts typing before explicitly creating one.
       */
      if (!conversationId) {
        conversation = await handleCreateConversation(
          chatDocumentId
        );

        if (!conversation) {
          return;
        }

        conversationId = conversation.id;
      }

      const result =
        await sendConversationMessage(
          conversationId,
          cleanQuestion,
          token
        );

      setConversationMessages((current) => [
        ...current,
        result.userMessage,
        result.assistantMessage,
      ]);

      setActiveConversation(
        result.conversation
      );

      setConversationQuestion("");

      setConversations((current) => {
        const updated =
          current.map((item) =>
            item.id === result.conversation.id
              ? result.conversation
              : item
          );

        return updated.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime()
        );
      });

      const stats = await getAiQueryStats(token);

      setAiQueryCount(stats.count || 0);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthTokens();
        router.replace("/login");
        return;
      }

      console.error(
        "SEND CONVERSATION MESSAGE ERROR:",
        error
      );

      setConversationError(
        error instanceof Error
          ? error.message
          : "Failed to send message."
      );
    } finally {
      setConversationSending(false);
    }
  }

  function handleConversationKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSendConversationMessage();
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Rename conversation                                                      */
  /* ------------------------------------------------------------------------ */

  function startRenameConversation(
    conversation: Conversation
  ) {
    setEditingConversationId(conversation.id);
    setEditingConversationTitle(
      conversation.title
    );
  }

  async function saveConversationRename() {
    if (!editingConversationId) return;

    const title =
      editingConversationTitle.trim();

    if (!title) {
      setEditingConversationId(null);
      return;
    }

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const result =
        await renameConversation(
          editingConversationId,
          title,
          token
        );

      setConversations((current) =>
        current.map((item) =>
          item.id === result.conversation.id
            ? result.conversation
            : item
        )
      );

      if (
        activeConversationId ===
        result.conversation.id
      ) {
        setActiveConversation(
          result.conversation
        );
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthTokens();
        router.replace("/login");
        return;
      }

      console.error(
        "RENAME CONVERSATION ERROR:",
        error
      );

      setConversationError(
        error instanceof Error
          ? error.message
          : "Failed to rename conversation."
      );
    } finally {
      setEditingConversationId(null);
      setEditingConversationTitle("");
    }
  }

  function handleRenameKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveConversationRename();
    }

    if (event.key === "Escape") {
      setEditingConversationId(null);
      setEditingConversationTitle("");
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Delete conversation                                                      */
  /* ------------------------------------------------------------------------ */

  async function handleDeleteConversation(
    conversationId: string
  ) {
    const conversation =
      conversations.find(
        (item) => item.id === conversationId
      );

    if (!conversation) return;

    const confirmed = window.confirm(
      `Delete "${conversation.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setDeletingConversationId(
        conversationId
      );

      await deleteConversation(
        conversationId,
        token
      );

      setConversations((current) =>
        current.filter(
          (item) => item.id !== conversationId
        )
      );

      if (
        activeConversationId ===
        conversationId
      ) {
        setActiveConversationId(null);
        setActiveConversation(null);
        setConversationMessages([]);
        setConversationQuestion("");
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthTokens();
        router.replace("/login");
        return;
      }

      console.error(
        "DELETE CONVERSATION ERROR:",
        error
      );

      setConversationError(
        error instanceof Error
          ? error.message
          : "Failed to delete conversation."
      );
    } finally {
      setDeletingConversationId(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* New chat                                                                 */
  /* ------------------------------------------------------------------------ */

  function handleNewChat() {
    setActiveConversationId(null);
    setActiveConversation(null);
    setConversationMessages([]);
    setConversationQuestion("");
    setConversationError("");
    setMobileHistoryOpen(false);
  }

  /* ------------------------------------------------------------------------ */
  /* Derived data                                                             */
  /* ------------------------------------------------------------------------ */

  const documentCount = documents.length;

  const indexedChunks = documents.reduce(
    (total, document) =>
      total +
      Number(document.chunk_count || 0),
    0
  );

  const isConnected =
    status === "Connected";

  const processedDocuments =
    documents.filter(
      (document) =>
        document.status === "processed"
    );

  const activeChatDocumentName =
    activeConversation?.document_id
      ? documents.find(
          (document) =>
            document.id ===
            activeConversation.document_id
        )?.name
      : null;

  const chatDocumentName =
    chatDocumentId
      ? documents.find(
          (document) =>
            document.id === chatDocumentId
        )?.name
      : null;

  /* ------------------------------------------------------------------------ */
  /* Navigation                                                               */
  /* ------------------------------------------------------------------------ */

  const navigation = [
    {
      label: "Overview",
      icon: "dashboard" as const,
      active: true,
    },
    {
      label: "Documents",
      icon: "documents" as const,
      active: false,
    },
    {
      label: "Semantic Search",
      icon: "search" as const,
      active: false,
    },
    {
      label: "AI Assistant",
      icon: "sparkles" as const,
      active: false,
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* Authentication loading                                                   */
  /* ------------------------------------------------------------------------ */

  if (authChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Checking authentication...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Preparing your workspace
          </p>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <div className="flex min-h-screen">

        {/* Mobile navigation overlay */}

        {mobileHistoryOpen && (
          <div
            className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm lg:hidden"
            onClick={() =>
              setMobileHistoryOpen(false)
            }
          />
        )}

        {mobileHistoryOpen && (
          <aside className="fixed inset-y-0 left-0 z-[70] flex w-[310px] flex-col bg-white shadow-2xl lg:hidden">
            <ConversationHistory
              conversations={conversations}
              conversationsLoading={
                conversationsLoading
              }
              activeConversationId={
                activeConversationId
              }
              editingConversationId={
                editingConversationId
              }
              editingConversationTitle={
                editingConversationTitle
              }
              deletingConversationId={
                deletingConversationId
              }
              onNewChat={handleNewChat}
              onSelectConversation={
                handleSelectConversation
              }
              onStartRename={
                startRenameConversation
              }
              onRenameChange={
                setEditingConversationTitle
              }
              onRenameKeyDown={
                handleRenameKeyDown
              }
              onSaveRename={
                saveConversationRename
              }
              onDeleteConversation={
                handleDeleteConversation
              }
              onClose={() =>
                setMobileHistoryOpen(false)
              }
            />
          </aside>
        )}

        {/* Desktop sidebar */}

        <aside className="hidden w-[270px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex h-[76px] items-center border-b border-slate-100 px-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-950 text-white shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-500 to-slate-950 opacity-90" />
                <span className="relative text-sm font-bold">
                  N
                </span>
              </div>

              <div>
                <p className="text-[15px] font-bold tracking-tight text-slate-950">
                  Nexora AI
                </p>
                <p className="text-[11px] font-medium text-slate-400">
                  Intelligent workspace
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Workspace
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.label}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                    item.active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    name={item.icon}
                    size={17}
                    strokeWidth={
                      item.active ? 2 : 1.7
                    }
                  />

                  <span>{item.label}</span>

                  {item.label ===
                    "AI Assistant" && (
                    <span className="ml-auto rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold text-violet-600">
                      AI
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="my-7 h-px bg-slate-100" />

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Quick actions
            </p>

            <button
              onClick={openFilePicker}
              disabled={uploading}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-[13px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:shadow-sm disabled:opacity-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                <Icon name="upload" size={16} />
              </span>

              <span>
                <span className="block">
                  {uploading
                    ? "Uploading..."
                    : "Upload document"}
                </span>

                <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
                  PDF files
                </span>
              </span>
            </button>

            <button
              onClick={handleNewChat}
              className="mt-2 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-[13px] font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon name="message" size={15} />
              </span>

              <span>
                <span className="block">
                  New AI chat
                </span>

                <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
                  Start a persistent conversation
                </span>
              </span>
            </button>
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
                  <Icon name="shield" size={16} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Workspace protected
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-slate-400">
                    Your document workspace is connected to the API.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  API status
                </span>

                <span className="flex items-center gap-1.5 text-[10px] font-semibold">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isConnected
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  />

                  <span
                    className={
                      isConnected
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  >
                    {status}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setMobileHistoryOpen(true)
                }
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
                aria-label="Open chat history"
              >
                <Icon name="menu" size={18} />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold tracking-tight text-slate-950 sm:text-base">
                    Overview
                  </h1>

                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                  <span className="hidden text-xs text-slate-400 sm:block">
                    Document intelligence workspace
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleNewChat}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:flex"
              >
                <Icon name="message" size={14} />
                New Chat
              </button>

              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 sm:flex">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isConnected
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />

                <span className="text-[11px] font-semibold text-slate-600">
                  {isConnected
                    ? "System online"
                    : "System offline"}
                </span>
              </div>

              <button
                onClick={openFilePicker}
                disabled={uploading}
                className="group flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 sm:px-4"
              >
                <Icon name="plus" size={15} />

                <span className="hidden sm:inline">
                  {uploading
                    ? "Uploading..."
                    : "Upload PDF"}
                </span>

                <span className="sm:hidden">
                  Upload
                </span>
              </button>
            </div>
          </header>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <main className="flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

              {/* Hero */}

              <section className="relative mb-7 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
                <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/4 -translate-y-1/4 rounded-full bg-indigo-100/50 blur-3xl" />

                <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
                  <div className="max-w-3xl">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-white">
                        <Icon name="sparkles" size={11} />
                      </span>

                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        AI document intelligence
                      </span>
                    </div>

                    <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[46px] lg:leading-[1.05]">
                      Your documents,
                      <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-slate-900 bg-clip-text text-transparent">
                        understood by AI.
                      </span>
                    </h2>

                    <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                      Upload your PDFs, search their content semantically,
                      and have persistent AI conversations grounded in
                      your own knowledge base.
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <button
                        onClick={openFilePicker}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                      >
                        <Icon name="upload" size={16} />

                        {uploading
                          ? "Processing..."
                          : "Upload a document"}

                        {!uploading && (
                          <Icon name="arrow" size={15} />
                        )}
                      </button>

                      <button
                        onClick={handleNewChat}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"
                      >
                        <Icon name="message" size={15} />
                        Start AI Chat
                      </button>
                    </div>
                  </div>

                  <div className="hidden items-center justify-center lg:flex">
                    <div className="relative h-48 w-48">
                      <div className="absolute inset-4 rounded-[32px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 shadow-xl" />

                      <div className="absolute left-8 top-7 h-32 w-24 rotate-[-7deg] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                        <div className="mb-3 h-2 w-12 rounded-full bg-slate-200" />

                        <div className="space-y-2">
                          <div className="h-1.5 w-full rounded-full bg-slate-100" />
                          <div className="h-1.5 w-4/5 rounded-full bg-slate-100" />
                          <div className="h-1.5 w-full rounded-full bg-slate-100" />
                          <div className="h-1.5 w-3/5 rounded-full bg-slate-100" />
                        </div>

                        <div className="mt-5 h-8 rounded-lg bg-indigo-50" />
                      </div>

                      <div className="absolute bottom-5 right-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl">
                        <Icon name="sparkles" size={27} />
                      </div>

                      <div className="absolute right-1 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm">
                        <Icon name="check" size={15} />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Persistent AI Chat */}

              <section className="mb-7 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_15px_50px_-35px_rgba(15,23,42,0.4)]">
                <div className="grid min-h-[680px] lg:grid-cols-[280px_1fr]">

                  {/* Chat history */}

                  <div className="hidden border-r border-slate-100 bg-slate-50 lg:block">
                    <ConversationHistory
                      conversations={conversations}
                      conversationsLoading={
                        conversationsLoading
                      }
                      activeConversationId={
                        activeConversationId
                      }
                      editingConversationId={
                        editingConversationId
                      }
                      editingConversationTitle={
                        editingConversationTitle
                      }
                      deletingConversationId={
                        deletingConversationId
                      }
                      onNewChat={handleNewChat}
                      onSelectConversation={
                        handleSelectConversation
                      }
                      onStartRename={
                        startRenameConversation
                      }
                      onRenameChange={
                        setEditingConversationTitle
                      }
                      onRenameKeyDown={
                        handleRenameKeyDown
                      }
                      onSaveRename={
                        saveConversationRename
                      }
                      onDeleteConversation={
                        handleDeleteConversation
                      }
                    />
                  </div>

                  {/* Chat */}

                  <div className="flex min-w-0 flex-col">
                    <div className="flex min-h-[76px] items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
                          <Icon
                            name="sparkles"
                            size={19}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-bold text-slate-950">
                              {activeConversation
                                ? activeConversation.title
                                : "Nexora AI Chat"}
                            </h3>

                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                              AI
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">
                              {activeChatDocumentName ||
                                "All indexed documents"}
                            </span>

                            {activeConversation && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="text-[10px] text-emerald-500">
                                  Persistent chat
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleNewChat}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                        >
                          <Icon name="plus" size={13} />
                          <span className="hidden sm:inline">
                            New Chat
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            setMobileHistoryOpen(true)
                          }
                          className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
                        >
                          <Icon
                            name="message"
                            size={15}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Document scope */}

                    <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Chat document scope
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-500">
                            Choose a document before starting a new chat.
                          </p>
                        </div>

                        <select
                          value={
                            activeConversation
                              ? activeConversation.document_id ||
                                ""
                              : chatDocumentId || ""
                          }
                          disabled={
                            Boolean(
                              activeConversation
                            ) ||
                            conversationSending
                          }
                          onChange={(event) =>
                            setChatDocumentId(
                              event.target.value ||
                                null
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-100 sm:w-[300px]"
                        >
                          <option value="">
                            All documents
                          </option>

                          {processedDocuments.map(
                            (document) => (
                              <option
                                key={document.id}
                                value={document.id}
                              >
                                {document.name}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Messages */}

                    <div
                      ref={chatScrollRef}
                      className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
                    >
                      {conversationLoading ? (
                        <div className="flex min-h-[430px] items-center justify-center">
                          <div className="text-center">
                            <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                            <p className="mt-3 text-xs font-semibold text-slate-600">
                              Loading conversation...
                            </p>
                          </div>
                        </div>
                      ) : conversationMessages.length ===
                        0 ? (
                        <div className="flex min-h-[430px] items-center justify-center">
                          <div className="max-w-md text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                              <Icon
                                name="sparkles"
                                size={28}
                              />
                            </div>

                            <h4 className="mt-5 text-base font-bold text-slate-900">
                              Start a conversation
                            </h4>

                            <p className="mt-2 text-xs leading-5 text-slate-400">
                              Ask questions about your indexed
                              documents. Nexora will keep the
                              conversation history so you can ask
                              follow-up questions naturally.
                            </p>

                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                              {[
                                "Summarize this document",
                                "What are the key points?",
                                "Find important dates",
                              ].map((prompt) => (
                                <button
                                  key={prompt}
                                  onClick={() =>
                                    setConversationQuestion(
                                      prompt
                                    )
                                  }
                                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-medium text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                >
                                  {prompt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mx-auto max-w-4xl space-y-6">
                          {conversationMessages.map(
                            (message) => (
                              <ChatMessage
                                key={message.id}
                                message={message}
                              />
                            )
                          )}

                          {conversationSending && (
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                                <Icon
                                  name="sparkles"
                                  size={14}
                                />
                              </div>

                              <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
                                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:120ms]" />
                                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:240ms]" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Error */}

                    {conversationError && (
                      <div className="mx-5 mb-3 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700 sm:mx-6">
                        <Icon
                          name="alert"
                          size={16}
                        />

                        <div className="min-w-0">
                          <p className="text-xs font-bold">
                            Unable to continue
                          </p>

                          <p className="mt-0.5 text-[10px] text-red-500">
                            {conversationError}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setConversationError("")
                          }
                          className="ml-auto text-red-400 hover:text-red-600"
                        >
                          <Icon
                            name="close"
                            size={14}
                          />
                        </button>
                      </div>
                    )}

                    {/* Composer */}

                    <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
                      <div className="relative">
                        <textarea
                          value={
                            conversationQuestion
                          }
                          onChange={(event) =>
                            setConversationQuestion(
                              event.target.value
                            )
                          }
                          onKeyDown={
                            handleConversationKeyDown
                          }
                          disabled={
                            conversationSending
                          }
                          rows={2}
                          placeholder="Ask a follow-up question..."
                          className="max-h-40 min-h-[74px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 pr-16 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:opacity-60"
                        />

                        <button
                          onClick={
                            handleSendConversationMessage
                          }
                          disabled={
                            conversationSending ||
                            !conversationQuestion.trim()
                          }
                          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Send message"
                        >
                          {conversationSending ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <Icon
                              name="send"
                              size={15}
                            />
                          )}
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-[9px] text-slate-400">
                          Enter to send · Shift + Enter for a new line
                        </p>

                        <p className="hidden text-[9px] text-slate-400 sm:block">
                          Grounded responses with citations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Existing one-off Ask Nexora */}

              <section className="mb-7">
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_15px_50px_-35px_rgba(15,23,42,0.4)]">
                  <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                        <Icon
                          name="sparkles"
                          size={19}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-950">
                            Ask Nexora
                          </h3>

                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-600">
                            QUICK QUERY
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          One-off document question without creating a conversation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label
                        htmlFor="nexora-document"
                        className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
                      >
                        Search scope
                      </label>

                      <select
                        id="nexora-document"
                        value={
                          selectedDocumentId ?? ""
                        }
                        onChange={(event) => {
                          setSelectedDocumentId(
                            event.target.value ||
                              null
                          );
                          setAnswer("");
                          setCitations([]);
                          setAskError("");
                        }}
                        disabled={
                          asking ||
                          documentsLoading
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 sm:w-auto sm:min-w-[240px]"
                      >
                        <option value="">
                          All documents
                        </option>

                        {documents.map(
                          (document) => (
                            <option
                              key={document.id}
                              value={document.id}
                            >
                              {document.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {[
                        "Summarize this document",
                        "What are the key points?",
                        "Find important dates",
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => {
                            if (
                              prompt ===
                                "Summarize this document" &&
                              !selectedDocumentId
                            ) {
                              setAskError(
                                "Select a document first to summarize that document."
                              );
                              return;
                            }

                            setAskError("");
                            setQuestion(prompt);
                          }}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={question}
                        onChange={(event) =>
                          setQuestion(
                            event.target.value
                          )
                        }
                        onKeyDown={
                          handleQuestionKeyDown
                        }
                        disabled={asking}
                        placeholder="Ask anything about your documents..."
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-5 pr-28 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                      />

                      <button
                        onClick={
                          handleAskQuestion
                        }
                        disabled={
                          asking ||
                          !question.trim()
                        }
                        className="absolute right-2 top-2 flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40"
                      >
                        {asking ? (
                          <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Thinking
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">
                              Ask AI
                            </span>
                            <Icon
                              name="send"
                              size={14}
                            />
                          </>
                        )}
                      </button>
                    </div>

                    {askError && (
                      <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <Icon
                          name="alert"
                          size={17}
                        />

                        <div>
                          <p className="font-semibold">
                            Unable to answer
                          </p>

                          <p className="mt-0.5 text-xs text-red-500">
                            {askError}
                          </p>
                        </div>
                      </div>
                    )}

                    {answer && (
                      <div className="mt-5 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-white">
                        <div className="flex items-center justify-between border-b border-indigo-100/70 px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
                              <Icon
                                name="sparkles"
                                size={12}
                              />
                            </div>

                            <span className="text-xs font-bold text-slate-800">
                              Nexora&apos;s answer
                            </span>
                          </div>

                          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Grounded
                          </span>
                        </div>

                        <div className="px-5 py-5">
                          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {answer}
                          </p>
                        </div>
                      </div>
                    )}

                    {citations.length > 0 && (
                      <CitationGrid
                        citations={citations}
                      />
                    )}
                  </div>
                </div>
              </section>

              {/* Upload message */}

              {uploadMessage && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Icon
                        name={
                          uploadMessage
                            .toLowerCase()
                            .includes("failed") ||
                          uploadMessage
                            .toLowerCase()
                            .includes("error") ||
                          uploadMessage
                            .toLowerCase()
                            .includes("please")
                            ? "alert"
                            : "check"
                        }
                        size={14}
                      />
                    </div>

                    <p className="text-xs font-medium text-slate-600">
                      {uploadMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Stats */}

              <section className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon="documents"
                  label="Documents"
                  value={
                    documentsLoading
                      ? "..."
                      : documentCount
                  }
                  description="Uploaded documents"
                  badge="Library"
                  iconClass="bg-blue-50 text-blue-600"
                />

                <StatCard
                  icon="sparkles"
                  label="AI Queries"
                  value={aiQueryCount}
                  description="Questions answered"
                  badge="AI"
                  iconClass="bg-violet-50 text-violet-600"
                />

                <StatCard
                  icon="layers"
                  label="Indexed Chunks"
                  value={
                    documentsLoading
                      ? "..."
                      : indexedChunks
                  }
                  description="Semantic search units"
                  badge="Indexed"
                  iconClass="bg-amber-50 text-amber-600"
                />

                <StatCard
                  icon="activity"
                  label="System"
                  value={
                    isConnected
                      ? "Online"
                      : "Offline"
                  }
                  description="Backend API connection"
                  badge={
                    isConnected
                      ? "Healthy"
                      : "Offline"
                  }
                  iconClass={
                    isConnected
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }
                />
              </section>

              {/* Documents */}

              <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_15px_50px_-35px_rgba(15,23,42,0.4)]">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-950">
                        Recent documents
                      </h3>

                      {!documentsLoading && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                          {documentCount}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      Your latest indexed knowledge sources.
                    </p>
                  </div>

                  <button
                    onClick={openFilePicker}
                    disabled={uploading}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Icon
                      name="plus"
                      size={14}
                    />
                    Add document
                  </button>
                </div>

                <div className="p-4 sm:p-5">
                  {documentsLoading ? (
                    <div className="grid gap-3">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="animate-pulse rounded-2xl border border-slate-100 p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-slate-100" />
                            <div className="flex-1">
                              <div className="h-3 w-2/5 rounded-full bg-slate-100" />
                              <div className="mt-2 h-2 w-1/3 rounded-full bg-slate-100" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-12 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                        <Icon
                          name="file"
                          size={24}
                        />
                      </div>

                      <h4 className="mt-5 text-sm font-bold text-slate-900">
                        Your knowledge base is empty
                      </h4>

                      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                        Upload a PDF and Nexora will prepare it for
                        semantic search and AI-powered conversations.
                      </p>

                      <button
                        onClick={openFilePicker}
                        disabled={uploading}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        <Icon
                          name="upload"
                          size={15}
                        />
                        Upload your first PDF
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {documents.map(
                        (document) => {
                          const processed =
                            document.status ===
                            "processed";

                          return (
                            <div
                              key={document.id}
                              className="group rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-slate-200 hover:bg-slate-50/40 hover:shadow-sm"
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex min-w-0 items-center gap-3.5">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                    <Icon
                                      name="file"
                                      size={19}
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                                      {document.name}
                                    </p>

                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                                      <span>
                                        {document.page_count}{" "}
                                        {document.page_count ===
                                        1
                                          ? "page"
                                          : "pages"}
                                      </span>

                                      <span className="h-1 w-1 rounded-full bg-slate-300" />

                                      <span>
                                        {document.chunk_count}{" "}
                                        chunks
                                      </span>

                                      <span className="h-1 w-1 rounded-full bg-slate-300" />

                                      <span>
                                        {new Date(
                                          document.created_at
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pl-[58px] lg:pl-0">
                                  <span
                                    className={`mr-auto flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold capitalize ${
                                      processed
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-amber-50 text-amber-600"
                                    }`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        processed
                                          ? "bg-emerald-500"
                                          : "bg-amber-500"
                                      }`}
                                    />

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
                                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    <Icon
                                      name="eye"
                                      size={13}
                                    />

                                    <span className="hidden sm:inline">
                                      View
                                    </span>
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
                                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                  >
                                    {deletingDocumentId ===
                                    document.id ? (
                                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-red-500" />
                                    ) : (
                                      <Icon
                                        name="trash"
                                        size={14}
                                      />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </section>

              <footer className="flex flex-col gap-2 px-1 py-7 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Nexora AI · Intelligent document workspace
                </p>

                <div className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>
                    AI-powered semantic retrieval
                  </span>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>

      {/* PDF Preview Modal */}

      {(previewDocument ||
        previewLoading ||
        previewError) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closePreview();
            }
          }}
        >
          <div className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                  <Icon
                    name="file"
                    size={17}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                    {previewDocument?.name ||
                      "Document Preview"}
                  </h3>

                  {previewDocument && (
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Secure temporary preview
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={closePreview}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Icon
                  name="close"
                  size={15}
                />

                <span className="hidden sm:inline">
                  Close
                </span>
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-100">
              {previewLoading && (
                <div className="text-center">
                  <span className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                  <p className="mt-4 text-xs font-semibold text-slate-600">
                    Preparing document preview
                  </p>
                </div>
              )}

              {!previewLoading &&
                previewError && (
                  <div className="mx-4 max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <Icon
                        name="alert"
                        size={19}
                      />
                    </div>

                    <h4 className="mt-4 text-sm font-bold text-red-700">
                      Preview unavailable
                    </h4>

                    <p className="mt-2 text-xs leading-5 text-red-500">
                      {previewError}
                    </p>

                    <button
                      onClick={closePreview}
                      className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white"
                    >
                      Close preview
                    </button>
                  </div>
                )}

              {!previewLoading &&
                !previewError &&
                previewDocument && (
                  <iframe
                    src={
                      previewDocument.previewUrl
                    }
                    title={
                      previewDocument.name
                    }
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

/* -------------------------------------------------------------------------- */
/* Conversation history                                                      */
/* -------------------------------------------------------------------------- */

function ConversationHistory({
  conversations,
  conversationsLoading,
  activeConversationId,
  editingConversationId,
  editingConversationTitle,
  deletingConversationId,
  onNewChat,
  onSelectConversation,
  onStartRename,
  onRenameChange,
  onRenameKeyDown,
  onSaveRename,
  onDeleteConversation,
  onClose,
}: {
  conversations: Conversation[];
  conversationsLoading: boolean;
  activeConversationId: string | null;
  editingConversationId: string | null;
  editingConversationTitle: string;
  deletingConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (
    id: string
  ) => void;
  onStartRename: (
    conversation: Conversation
  ) => void;
  onRenameChange: (
    value: string
  ) => void;
  onRenameKeyDown: (
    event: KeyboardEvent<HTMLInputElement>
  ) => void;
  onSaveRename: () => void;
  onDeleteConversation: (
    id: string
  ) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
        <div>
          <p className="text-xs font-bold text-slate-900">
            Chat history
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            Persistent conversations
          </p>
        </div>

        <div className="flex items-center gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            >
              <Icon
                name="close"
                size={15}
              />
            </button>
          )}

          <button
            onClick={onNewChat}
            className="rounded-lg bg-slate-950 p-2 text-white hover:bg-slate-800"
            aria-label="New chat"
          >
            <Icon
              name="plus"
              size={15}
            />
          </button>
        </div>
      </div>

      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-bold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
        >
          <Icon
            name="message"
            size={14}
          />
          New conversation
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {conversationsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl bg-white p-3"
                >
                  <div className="h-2.5 w-3/4 rounded-full bg-slate-100" />
                  <div className="mt-2 h-2 w-1/2 rounded-full bg-slate-100" />
                </div>
              )
            )}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Icon
                name="message"
                size={17}
              />
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-600">
              No conversations
            </p>

            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              Start a new chat to create your first persistent conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {conversations.map(
              (conversation) => {
                const active =
                  activeConversationId ===
                  conversation.id;

                const editing =
                  editingConversationId ===
                  conversation.id;

                const deleting =
                  deletingConversationId ===
                  conversation.id;

                return (
                  <div
                    key={conversation.id}
                    className={`group relative rounded-xl border transition ${
                      active
                        ? "border-indigo-100 bg-indigo-50/70"
                        : "border-transparent hover:border-slate-200 hover:bg-white"
                    }`}
                  >
                    {editing ? (
                      <div className="p-2">
                        <input
                          autoFocus
                          value={
                            editingConversationTitle
                          }
                          onChange={(event) =>
                            onRenameChange(
                              event.target.value
                            )
                          }
                          onKeyDown={
                            onRenameKeyDown
                          }
                          onBlur={
                            onSaveRename
                          }
                          className="w-full rounded-lg border border-indigo-200 bg-white px-2.5 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-50"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          onSelectConversation(
                            conversation.id
                          )
                        }
                        disabled={deleting}
                        className="w-full px-3 py-3 text-left disabled:opacity-50"
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              active
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Icon
                              name="message"
                              size={13}
                            />
                          </div>

                          <div className="min-w-0 flex-1 pr-8">
                            <p className="truncate text-[11px] font-bold text-slate-700">
                              {conversation.title}
                            </p>

                            <p className="mt-1 truncate text-[9px] text-slate-400">
                              {new Date(
                                conversation.updated_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    )}

                    {!editing && (
                      <div className="absolute right-2 top-2 hidden items-center gap-0.5 group-hover:flex">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onStartRename(
                              conversation
                            );
                          }}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
                          aria-label="Rename conversation"
                        >
                          <Icon
                            name="edit"
                            size={12}
                          />
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteConversation(
                              conversation.id
                            );
                          }}
                          disabled={deleting}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete conversation"
                        >
                          {deleting ? (
                            <span className="block h-3 w-3 animate-spin rounded-full border border-slate-200 border-t-red-500" />
                          ) : (
                            <Icon
                              name="trash"
                              size={12}
                            />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chat message                                                               */
/* -------------------------------------------------------------------------- */

function ChatMessage({
  message,
}: {
  message: ConversationMessage;
}) {
  const isUser =
    message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser
          ? "justify-end"
          : ""
      }`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          <Icon
            name="sparkles"
            size={14}
          />
        </div>
      )}

      <div
        className={`max-w-[85%] ${
          isUser
            ? "order-first"
            : ""
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "rounded-tr-md bg-slate-950 text-white"
              : "rounded-tl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
          }`}
        >
          <p
            className={`whitespace-pre-wrap text-sm leading-6 ${
              isUser
                ? "text-white"
                : "text-slate-700"
            }`}
          >
            {message.content}
          </p>
        </div>

        {!isUser &&
          message.citations &&
          message.citations.length > 0 && (
            <div className="mt-2">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Sources
                </span>

                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">
                  {message.citations.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {message.citations.map(
                  (citation, index) => (
                    <div
                      key={`${citation.documentId}-${citation.pageNumber}-${index}`}
                      className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-500">
                        <Icon
                          name="file"
                          size={11}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-semibold text-slate-600">
                          {citation.documentName}
                        </p>

                        <p className="text-[8px] text-slate-400">
                          Page{" "}
                          {citation.pageNumber}
                        </p>
                      </div>

                      {Number(
                        citation.similarity
                      ) > 0 && (
                        <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[8px] font-bold text-indigo-600">
                          {(
                            Number(
                              citation.similarity
                            ) * 100
                          ).toFixed(0)}
                          %
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        <p
          className={`mt-1.5 text-[8px] ${
            isUser
              ? "text-right text-slate-400"
              : "text-slate-400"
          }`}
        >
          {new Date(
            message.created_at
          ).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Citation grid                                                              */
/* -------------------------------------------------------------------------- */

function CitationGrid({
  citations,
}: {
  citations: Citation[];
}) {
  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-800">
            Sources
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            Retrieved from your documents
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold text-slate-500">
          {citations.length} sources
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {citations.map(
          (citation, index) => {
            const similarity =
              Number(
                citation.similarity
              ) * 100;

            return (
              <div
                key={`${citation.documentId}-${citation.pageNumber}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                    <Icon
                      name="file"
                      size={16}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {citation.documentName}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Page{" "}
                      {citation.pageNumber}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-600">
                  {similarity.toFixed(1)}%
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon,
  label,
  value,
  description,
  badge,
  iconClass,
}: {
  icon:
    | "documents"
    | "sparkles"
    | "layers"
    | "activity";
  label: string;
  value: string | number;
  description: string;
  badge: string;
  iconClass: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_-30px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon
            name={icon}
            size={18}
          />
        </div>

        <span className="rounded-full bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
          {badge}
        </span>
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {description}
      </p>
    </div>
  );
}