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
    | "external";
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

    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

export default function Home() {

  /*
   * Authentication state
   *
   * IMPORTANT:
   * The dashboard starts in authChecking=true so the protected
   * dashboard never flashes before the redirect happens.
   */
  const [authChecking, setAuthChecking] = useState(true);

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

  const [selectedDocumentId, setSelectedDocumentId] =
    useState<string | null>(null);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------------------ */
  /* Authentication guard                                                     */
  /* ------------------------------------------------------------------------ */

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

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
    if (authChecking) {
      return;
    }

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
  }, [authChecking]);

  /* ------------------------------------------------------------------------ */
  /* Dashboard data                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (authChecking) {
      return;
    }

    async function loadDashboardData() {
      const token = localStorage.getItem("token");

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
        console.error("Failed to load dashboard data:", error);

        /*
         * If the token is invalid/expired, send the user back to login.
         */
        const message =
          error instanceof Error
            ? error.message.toLowerCase()
            : "";

        if (
          message.includes("unauthorized") ||
          message.includes("authentication") ||
          message.includes("token") ||
          message.includes("jwt")
        ) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }
      } finally {
        setDocumentsLoading(false);
      }
    }

    loadDashboardData();
  }, [authChecking, router]);

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
      router.replace("/login");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setUploadMessage("Uploading and processing document...");

      await uploadDocument(file, token);

      setUploadMessage("Document uploaded successfully.");

      const data = await getDocuments(token);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Document upload failed.";

      if (
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("authentication") ||
        message.toLowerCase().includes("token") ||
        message.toLowerCase().includes("jwt")
      ) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      setUploadMessage(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

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
      router.replace("/login");
      return;
    }

    try {
      setDeletingDocumentId(documentId);
      setUploadMessage(`Deleting "${documentName}"...`);

      await deleteDocument(documentId, token);

      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (document) => document.id !== documentId
        )
      );

      if (previewDocument?.id === documentId) {
        setPreviewDocument(null);
      }

      if (selectedDocumentId === documentId) {
        setSelectedDocumentId(null);
      }

      setUploadMessage("Document deleted successfully.");

      setAnswer("");
      setCitations([]);
    } catch (error) {
      console.error("DELETE DOCUMENT ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete document.";

      if (
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("authentication") ||
        message.toLowerCase().includes("token") ||
        message.toLowerCase().includes("jwt")
      ) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      setUploadMessage(message);
    } finally {
      setDeletingDocumentId(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Preview                                                                  */
  /* ------------------------------------------------------------------------ */

  async function handlePreviewDocument(documentId: string) {
    if (previewLoading) {
      return;
    }

    const token = localStorage.getItem("token");

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
      console.error("DOCUMENT PREVIEW ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to preview document.";

      if (
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("authentication") ||
        message.toLowerCase().includes("token") ||
        message.toLowerCase().includes("jwt")
      ) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      setPreviewError(message);
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreview() {
    setPreviewDocument(null);
    setPreviewError("");
  }

  /* ------------------------------------------------------------------------ */
  /* AI                                                                       */
  /* ------------------------------------------------------------------------ */

  async function handleAskQuestion() {
    if (!question.trim() || asking) {
      return;
    }

    const token = localStorage.getItem("token");

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

      const queryStats = await getAiQueryStats(token);
      setAiQueryCount(queryStats.count || 0);
    } catch (error) {
      console.error("ASK QUESTION ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to answer question";

      if (
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("authentication") ||
        message.toLowerCase().includes("token") ||
        message.toLowerCase().includes("jwt")
      ) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      setAskError(message);
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
  /* Derived data                                                             */
  /* ------------------------------------------------------------------------ */

  const documentCount = documents.length;

  const indexedChunks = documents.reduce(
    (total, document) =>
      total + Number(document.chunk_count || 0),
    0
  );

  const isConnected = status === "Connected";

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
  /* Authentication loading screen                                            */
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

        {/* Mobile overlay */}

        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* Sidebar */}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
            mobileNavOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
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

            <button
              onClick={() => setMobileNavOpen(false)}
              className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
              aria-label="Close navigation"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <div className="flex-1 px-4 py-6">
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
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Icon
                    name={item.icon}
                    size={17}
                    strokeWidth={item.active ? 2 : 1.7}
                  />

                  <span>{item.label}</span>

                  {item.label === "AI Assistant" && (
                    <span
                      className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        item.active
                          ? "bg-white/15 text-white"
                          : "bg-violet-50 text-violet-600"
                      }`}
                    >
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
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-[13px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
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
                  PDF files up to your limit
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

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">
                    Workspace protected
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-slate-400">
                    Your document workspace is connected to the API.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400">
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
                onClick={() => setMobileNavOpen(true)}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
                aria-label="Open navigation"
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
                className="group flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
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

                <div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 translate-y-1/2 rounded-full bg-violet-100/40 blur-3xl" />

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
                      and ask questions with answers grounded in your
                      own knowledge base.
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <button
                        onClick={openFilePicker}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Icon name="upload" size={16} />

                        {uploading
                          ? "Processing..."
                          : "Upload a document"}

                        {!uploading && (
                          <Icon name="arrow" size={15} />
                        )}
                      </button>

                      <div className="flex items-center gap-2 px-1 text-xs text-slate-400">
                        <Icon name="shield" size={15} />

                        <span>
                          Secure document workspace
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden items-center justify-center lg:flex">
                    <div className="relative h-48 w-48">
                      <div className="absolute inset-4 rounded-[32px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 shadow-xl shadow-indigo-100/40" />

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

              {/* AI workspace */}

              <section className="mb-7">
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_15px_50px_-35px_rgba(15,23,42,0.4)]">
                  <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200">
                          <Icon name="sparkles" size={19} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-950">
                              Ask Nexora
                            </h3>

                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                              AI
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            Ask questions about your indexed documents.
                          </p>
                        </div>
                      </div>

                      <div className="hidden items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-400 sm:flex">
                        <Icon name="search" size={12} />
                        Semantic retrieval
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    {!question &&
                      !answer &&
                      !asking &&
                      !askError && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {[
                            "Summarize this document",
                            "What are the key points?",
                            "Find important dates",
                          ].map((prompt) => (
                            <button
                              key={prompt}
                              onClick={() => {
                                if (prompt === "Summarize this document" && !selectedDocumentId) {
                                  setAskError("Select a document first to summarize that document.");
                                  return;
                                }
                                setAskError("");
                                setQuestion(prompt);
                              }}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      )}

                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label
                        htmlFor="nexora-document"
                        className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
                      >
                        Search scope
                      </label>

                      <select
                        id="nexora-document"
                        value={selectedDocumentId ?? ""}
                        onChange={(event) => {
                          setSelectedDocumentId(
                            event.target.value || null
                          );
                          setAnswer("");
                          setCitations([]);
                          setAskError("");
                        }}
                        disabled={asking || documentsLoading}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[240px]"
                      >
                        <option value="">All documents</option>

                        {documents.map((document) => (
                          <option
                            key={document.id}
                            value={document.id}
                          >
                            {document.name}
                          </option>
                        ))}
                      </select>
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
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-5 pr-28 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
                      />

                      <button
                        onClick={handleAskQuestion}
                        disabled={
                          asking || !question.trim()
                        }
                        className="absolute right-2 top-2 flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
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

                            <Icon name="send" size={14} />
                          </>
                        )}
                      </button>
                    </div>

                    {askError && (
                      <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <Icon name="alert" size={17} />

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
                              <Icon name="sparkles" size={12} />
                            </div>

                            <span className="text-xs font-bold text-slate-800">
                              Nexora&apos;s answer
                            </span>
                          </div>

                          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
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
                                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition hover:border-indigo-200 hover:shadow-sm"
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
                    )}
                  </div>
                </div>
              </section>

              {/* Upload message */}

              {uploadMessage && (
                <div className="mb-6 animate-fade-in">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        uploadMessage
                          .toLowerCase()
                          .includes("failed") ||
                        uploadMessage
                          .toLowerCase()
                          .includes("error") ||
                        uploadMessage
                          .toLowerCase()
                          .includes("please")
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
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
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_-30px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon name="documents" size={18} />
                    </div>

                    <span className="rounded-full bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Library
                    </span>
                  </div>

                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    Documents
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    {documentsLoading
                      ? "..."
                      : documentCount}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Uploaded documents
                  </p>
                </div>

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_-30px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Icon name="sparkles" size={18} />
                    </div>

                    <span className="rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-violet-500">
                      AI
                    </span>
                  </div>

                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    AI Queries
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    {aiQueryCount}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Questions answered
                  </p>
                </div>

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_-30px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Icon name="layers" size={18} />
                    </div>

                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-600">
                      Indexed
                    </span>
                  </div>

                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    Indexed Chunks
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    {documentsLoading
                      ? "..."
                      : indexedChunks}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Semantic search units
                  </p>
                </div>

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_-30px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isConnected
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <Icon name="activity" size={18} />
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                        isConnected
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {isConnected
                        ? "Healthy"
                        : "Offline"}
                    </span>
                  </div>

                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    System
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    {isConnected ? "Online" : "Offline"}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Backend API connection
                  </p>
                </div>
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
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Icon name="plus" size={14} />
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

                            <div className="h-7 w-16 rounded-lg bg-slate-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-12 text-center">
                      <div className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/60 blur-3xl" />

                      <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                        <Icon name="file" size={24} />
                      </div>

                      <h4 className="relative mt-5 text-sm font-bold text-slate-900">
                        Your knowledge base is empty
                      </h4>

                      <p className="relative mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                        Upload a PDF and Nexora will prepare it for
                        semantic search and AI-powered questions.
                      </p>

                      <button
                        onClick={openFilePicker}
                        disabled={uploading}
                        className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                      >
                        <Icon name="upload" size={15} />
                        Upload your first PDF
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {documents.map((document) => {
                        const processed =
                          document.status === "processed";

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
                                      {document.page_count === 1
                                        ? "page"
                                        : "pages"}
                                    </span>

                                    <span className="h-1 w-1 rounded-full bg-slate-300" />

                                    <span>
                                      {document.chunk_count} chunks
                                    </span>

                                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                                    <span className="uppercase">
                                      {document.file_type}
                                    </span>

                                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

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
                                  className={`mr-auto flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold capitalize sm:mr-2 ${
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
                                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Icon name="eye" size={13} />

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
                                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label={`Delete ${document.name}`}
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
                      })}
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
                  <span>AI-powered semantic retrieval</span>
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
            if (event.target === event.currentTarget) {
              closePreview();
            }
          }}
        >
          <div className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                  <Icon name="file" size={17} />
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
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <Icon name="close" size={15} />

                <span className="hidden sm:inline">
                  Close
                </span>
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-100">
              {previewLoading && (
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                  </div>

                  <p className="mt-4 text-xs font-semibold text-slate-600">
                    Preparing document preview
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Generating a secure temporary URL...
                  </p>
                </div>
              )}

              {!previewLoading && previewError && (
                <div className="mx-4 max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Icon name="alert" size={19} />
                  </div>

                  <h4 className="mt-4 text-sm font-bold text-red-700">
                    Preview unavailable
                  </h4>

                  <p className="mt-2 text-xs leading-5 text-red-500">
                    {previewError}
                  </p>

                  <button
                    onClick={closePreview}
                    className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    Close preview
                  </button>
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