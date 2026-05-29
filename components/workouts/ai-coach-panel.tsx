"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Brain,
  ChevronRight,
  Dumbbell,
  Flame,
  Leaf,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import type { AiCoachResponse } from "@/app/api/ai-coach/route";

/* ─── Types ──────────────────────────────────────────────── */
type Filters = {
  level: string;
  goal: string;
  equipment: string;
  duration: number;
};

type AiCoachPanelProps = {
  filters: Filters;
};

type Status = "idle" | "loading" | "success" | "error";

/* ─── Response card config ───────────────────────────────── */
const RESPONSE_CARDS = [
  {
    key: "workoutPlan" as const,
    label: "Workout Plan",
    icon: Dumbbell,
    gradient: "from-orange-500 to-pink-600",
    bg: "from-orange-50 to-pink-50",
    border: "border-orange-100",
    iconBg: "bg-gradient-to-br from-orange-400 to-pink-500",
  },
  {
    key: "nutritionAdvice" as const,
    label: "Nutrition Advice",
    icon: Leaf,
    gradient: "from-emerald-500 to-teal-600",
    bg: "from-emerald-50 to-teal-50",
    border: "border-emerald-100",
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
  },
  {
    key: "safetyNote" as const,
    label: "Safety Note",
    icon: ShieldCheck,
    gradient: "from-cyan-500 to-blue-600",
    bg: "from-cyan-50 to-blue-50",
    border: "border-cyan-100",
    iconBg: "bg-gradient-to-br from-cyan-400 to-blue-500",
  },
  {
    key: "explanation" as const,
    label: "Why This Works",
    icon: Brain,
    gradient: "from-violet-500 to-purple-600",
    bg: "from-violet-50 to-purple-50",
    border: "border-violet-100",
    iconBg: "bg-gradient-to-br from-violet-400 to-purple-500",
  },
] as const;

/* ─── Skeleton loader ────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-slate-200" />
        <div className="h-4 w-32 rounded-full bg-slate-200" />
      </div>
      <div className="space-y-2.5">
        <div className="h-3 w-full rounded-full bg-slate-100" />
        <div className="h-3 w-5/6 rounded-full bg-slate-100" />
        <div className="h-3 w-4/6 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export function AiCoachPanel({ filters }: AiCoachPanelProps) {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [response, setResponse] = useState<AiCoachResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAsk() {
    setStatus("loading");
    setResponse(null);
    setErrorMessage("");

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: filters.level,
          goal: filters.goal,
          equipment: filters.equipment,
          duration: filters.duration,
          question: question.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setResponse(data as AiCoachResponse);
      setStatus("success");
    } catch {
      setErrorMessage("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setResponse(null);
    setErrorMessage("");
    setQuestion("");
  }

  return (
    <section className="mt-6 space-y-5">
      {/* ── Header banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900" />
        {/* Glow blobs */}
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-12 left-12 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative z-10 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-5">
              {/* AI icon */}
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/40">
                <Bot className="h-7 w-7 text-white" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 shadow">
                  <Zap className="h-3 w-3 text-white" />
                </span>
              </div>
              <div>
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-300">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered Fitness Coach
                </div>
                <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                  AI Fitness Coach
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Personalized workout, nutrition & recovery advice — tailored to your current profile.
                </p>
              </div>
            </div>

            {/* Profile pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: filters.level, color: "bg-violet-500/20 text-violet-300 border-violet-400/30" },
                { label: filters.goal, color: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" },
                { label: filters.equipment, color: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30" },
                { label: `${filters.duration} min`, color: "bg-orange-500/20 text-orange-300 border-orange-400/30" },
              ].map((p) => (
                <span
                  key={p.label}
                  className={`rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-sm ${p.color}`}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Input + button */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <MessageSquare className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && status !== "loading") handleAsk();
                }}
                placeholder="Optional: ask a specific question (e.g. 'How do I improve my squat form?')"
                maxLength={200}
                disabled={status === "loading"}
                className="h-12 w-full rounded-xl border border-white/10 bg-white/8 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none backdrop-blur-sm transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
              />
            </div>
            <button
              type="button"
              onClick={handleAsk}
              disabled={status === "loading"}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-7 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:scale-105 hover:shadow-violet-500/50 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Ask AI Coach
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading skeletons ──────────────────────────────── */}
      {status === "loading" && (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Error state ───────────────────────────────────── */}
      {status === "error" && (
        <div className="flex items-start gap-4 rounded-2xl border border-orange-100 bg-orange-50 px-5 py-5 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 shadow">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-orange-800">Could not get a response</p>
            <p className="mt-0.5 text-sm text-orange-700">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-orange-700 shadow-sm hover:bg-orange-100 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      )}

      {/* ── Success response cards ─────────────────────────── */}
      {status === "success" && response && (
        <>
          {/* Context summary bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <Flame className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-600">
              AI coaching based on:
            </span>
            {[
              filters.level,
              filters.goal,
              filters.equipment,
              `${filters.duration} min`,
            ].map((v) => (
              <span
                key={v}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700"
              >
                {v}
              </span>
            ))}
            {question.trim() && (
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700 max-w-xs truncate">
                Q: {question.trim()}
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="ml-auto inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
            >
              <RefreshCw className="h-3 w-3" />
              New question
            </button>
          </div>

          {/* 4 response cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {RESPONSE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className={`card-hover group rounded-2xl border bg-gradient-to-br p-5 shadow-md ${card.bg} ${card.border}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow ${card.iconBg}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-extrabold text-slate-800">{card.label}</h3>
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:translate-x-1" />
                  </div>
                  <p className="text-sm leading-7 text-slate-700">{response[card.key]}</p>
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-xs text-slate-500 leading-5">
              <span className="font-bold text-slate-600">Disclaimer:</span>{" "}
              AI suggestions are for general fitness guidance only. They are not a substitute for
              professional medical advice, diagnosis, or treatment. Always consult a qualified
              healthcare provider before starting a new exercise or nutrition program.
            </p>
          </div>
        </>
      )}

      {/* ── Idle hint (first visit) ────────────────────────── */}
      {status === "idle" && (
        <div className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-200">
            <Sparkles className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">
              Your AI Coach is ready
            </p>
            <p className="text-xs text-slate-500">
              Hit <span className="font-semibold text-violet-600">&quot;Ask AI Coach&quot;</span> to get a personalized plan based on your current filters, or type a specific question first.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
