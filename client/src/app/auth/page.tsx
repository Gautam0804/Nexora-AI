"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Eye,
  EyeOff,
  FileSearch,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "error" | "success" | ""
  >("");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 6,
      number: /\d/.test(password),
      letter: /[A-Za-z]/.test(password),
    }),
    [password]
  );

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (!password) {
      return {
        label: "",
        width: "0%",
      };
    }

    if (score <= 2) {
      return {
        label: "Weak",
        width: "33%",
      };
    }

    if (score <= 4) {
      return {
        label: "Good",
        width: "66%",
      };
    }

    return {
      label: "Strong",
      width: "100%",
    };
  }, [password]);

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setMessage("");
    setMessageType("");
    setPassword("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      if (!API_URL) {
        throw new Error(
          "API URL is not configured. Please check NEXT_PUBLIC_API_URL."
        );
      }

      const endpoint =
        mode === "login"
          ? "/api/auth/login"
          : "/api/auth/register";

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            (mode === "login"
              ? "Invalid email or password."
              : "Unable to create your account.")
        );
      }

      if (mode === "login") {
        const token = data?.token || data?.accessToken;

        if (!token) {
          console.error("Login response:", data);

          throw new Error(
            "Login succeeded, but no authentication token was returned."
          );
        }

        // Clear stale credentials first.
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("accessToken");

        // Persist token according to Remember Me.
        if (rememberMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("accessToken", token);
        } else {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("accessToken", token);
        }

        console.log("Login successful. Token stored.");

        setMessage("Authentication successful. Opening dashboard...");
        setMessageType("success");

        // Small delay gives the success state time to render.
        setTimeout(() => {
          router.replace("/");
        }, 250);

        return;
      }

      // Registration succeeded.
      setMode("login");
      setMessage(
        "Account created successfully. You can now sign in."
      );
      setMessageType("success");
      setPassword("");
    } catch (error) {
      console.error("Authentication error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#060912]" />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060912] text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">

        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">

          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <section className="relative hidden min-h-[760px] overflow-hidden border-r border-white/10 p-10 lg:flex lg:flex-col xl:p-14">

            {/* Brand */}
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 shadow-lg shadow-blue-500/10">
                <BrainCircuit className="h-6 w-6 text-blue-400" />
              </div>

              <div>
                <div className="text-lg font-bold tracking-tight">
                  Nexora AI
                </div>

                <div className="text-xs text-slate-500">
                  Document Intelligence
                </div>
              </div>

            </div>

            {/* Hero */}
            <div className="mt-auto">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered knowledge workspace
              </div>

              <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight xl:text-5xl">

                Turn your documents into

                <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                  intelligent conversations.
                </span>

              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Upload your documents, ask questions, discover
                insights, and interact with your knowledge using
                Nexora AI.
              </p>

              {/* Features */}
              <div className="mt-10 grid gap-3 sm:grid-cols-2">

                <FeatureCard
                  icon={<FileSearch className="h-5 w-5" />}
                  title="Smart document search"
                  description="Find relevant information instantly."
                />

                <FeatureCard
                  icon={<MessageSquareText className="h-5 w-5" />}
                  title="Context-aware AI"
                  description="Ask questions naturally."
                />

                <FeatureCard
                  icon={<UploadCloud className="h-5 w-5" />}
                  title="Centralized knowledge"
                  description="Keep your documents organized."
                />

                <FeatureCard
                  icon={<Zap className="h-5 w-5" />}
                  title="Fast responses"
                  description="Get answers without digging."
                />

              </div>

              {/* Security */}
              <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">

                <ShieldCheck className="h-5 w-5 text-emerald-400" />

                <span>
                  Secure authentication and protected workspace
                </span>

              </div>

            </div>

            {/* Footer */}
            <div className="mt-10 text-xs text-slate-600">
              © {new Date().getFullYear()} Nexora AI. All rights reserved.
            </div>

          </section>

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <section className="flex min-h-[760px] items-center justify-center p-6 sm:p-10">

            <div className="w-full max-w-md">

              {/* Mobile brand */}
              <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                  <BrainCircuit className="h-6 w-6 text-blue-400" />
                </div>

                <div>
                  <div className="text-lg font-bold">
                    Nexora AI
                  </div>

                  <div className="text-xs text-slate-500">
                    Document Intelligence
                  </div>
                </div>

              </div>

              {/* Header */}
              <div className="mb-8">

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 lg:hidden">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  {mode === "login"
                    ? "Welcome back"
                    : "Create your account"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {mode === "login"
                    ? "Sign in to continue to your intelligent workspace."
                    : "Create your Nexora AI workspace in a few seconds."}
                </p>

              </div>

              {/* Login/Register switch */}
              <div className="mb-7 grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1">

                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    mode === "login"
                      ? "bg-white/10 text-white shadow"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    mode === "register"
                      ? "bg-white/10 text-white shadow"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Create account
                </button>

              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 focus:bg-black/30 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

                {/* Password */}
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-300"
                    >
                      Password
                    </label>

                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMessage(
                            "Password reset is not configured yet."
                          );
                          setMessageType("error");
                        }}
                        className="text-xs font-medium text-blue-400 hover:text-blue-300"
                      >
                        Forgot password?
                      </button>
                    )}

                  </div>

                  <div className="relative">

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder={
                        mode === "login"
                          ? "Enter your password"
                          : "Create a strong password"
                      }
                      autoComplete={
                        mode === "login"
                          ? "current-password"
                          : "new-password"
                      }
                      required
                      minLength={6}
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 focus:bg-black/30 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                  </div>

                  {/* Password strength */}
                  {mode === "register" && password && (
                    <div className="mt-3">

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-xs text-slate-500">
                          Password strength
                        </span>

                        <span className="text-xs text-slate-400">
                          {passwordStrength.label}
                        </span>

                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400 transition-all duration-300"
                          style={{
                            width:
                              passwordStrength.width,
                          }}
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">

                        <PasswordCheck
                          valid={passwordChecks.length}
                          text="6+ characters"
                        />

                        <PasswordCheck
                          valid={passwordChecks.letter}
                          text="Letters"
                        />

                        <PasswordCheck
                          valid={passwordChecks.number}
                          text="Number"
                        />

                      </div>

                    </div>
                  )}

                </div>

                {/* Remember me */}
                {mode === "login" && (
                  <label className="flex cursor-pointer items-center gap-3">

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-500"
                    />

                    <span className="text-sm text-slate-400">
                      Remember me
                    </span>

                  </label>
                )}

                {/* Message */}
                {message && (
                  <div
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                      messageType === "success"
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                        : "border-red-500/20 bg-red-500/5 text-red-300"
                    }`}
                  >

                    {messageType === "success" ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
                    )}

                    <span>{message}</span>

                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition-all hover:from-blue-500 hover:to-violet-500 hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {mode === "login"
                        ? "Signing in..."
                        : "Creating account..."}
                    </>
                  ) : (
                    <>
                      {mode === "login"
                        ? "Sign in to Nexora"
                        : "Create Nexora account"}

                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}

                </button>

              </form>

              {/* Security */}
              <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-600">

                <LockKeyhole className="h-3.5 w-3.5" />

                <span>
                  Your workspace is protected by secure authentication
                </span>

              </div>

              {/* Mobile features */}
              <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">

                <MiniFeature
                  icon={<BrainCircuit className="h-4 w-4" />}
                  text="AI-powered"
                />

                <MiniFeature
                  icon={<FileSearch className="h-4 w-4" />}
                  text="Document RAG"
                />

                <MiniFeature
                  icon={<ShieldCheck className="h-4 w-4" />}
                  text="Secure"
                />

                <MiniFeature
                  icon={<Zap className="h-4 w-4" />}
                  text="Fast"
                />

              </div>

            </div>

          </section>

        </div>

      </div>
    </main>
  );
}

/* ========================================================= */
/* FEATURE CARD */
/* ========================================================= */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition hover:border-blue-500/20 hover:bg-white/[0.04]">

      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500/15">
        {icon}
      </div>

      <div className="text-sm font-medium text-slate-200">
        {title}
      </div>

      <div className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </div>

    </div>
  );
}

/* ========================================================= */
/* PASSWORD CHECK */
/* ========================================================= */

function PasswordCheck({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 ${
        valid
          ? "text-emerald-400"
          : "text-slate-600"
      }`}
    >
      <Check className="h-3 w-3" />
      <span>{text}</span>
    </div>
  );
}

/* ========================================================= */
/* MOBILE FEATURE */
/* ========================================================= */

function MiniFeature({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2.5 text-xs text-slate-400">
      <span className="text-blue-400">
        {icon}
      </span>

      {text}
    </div>
  );
}