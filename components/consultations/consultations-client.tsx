"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acceptConsultationAction,
  rejectConsultationAction,
  completeConsultationAction
} from "@/lib/consultation-actions";
import {
  Heart,
  User,
  Activity,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export type ConsultationListItem = {
  id: string;
  topic: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  createdAt: string;
  scheduledAt?: string | null;
  completedAt?: string | null;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
};

type Props = {
  role: "USER" | "TRAINER" | "DIETITIAN";
  incomingRequests: ConsultationListItem[];
  outgoingRequests: ConsultationListItem[];
};

export function ConsultationsClient({
  role,
  incomingRequests,
  outgoingRequests
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "history">("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"incoming" | "outgoing">("incoming");

  const isProfessional = role === "TRAINER" || role === "DIETITIAN";
  const requests = isProfessional
    ? (viewMode === "incoming" ? incomingRequests : outgoingRequests)
    : outgoingRequests;

  const pending = requests.filter((r) => r.status === "PENDING");
  const active = requests.filter((r) => r.status === "ACCEPTED");
  const history = requests.filter((r) => r.status === "REJECTED" || r.status === "COMPLETED");

  const activeList =
    activeTab === "pending" ? pending : activeTab === "active" ? active : history;

  const handleAccept = (id: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await acceptConsultationAction(id);
      if (res.success) {
        router.refresh();
      } else {
        setErrorMessage(res.error ?? "Failed to accept consultation request.");
      }
    });
  };

  const handleReject = (id: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await rejectConsultationAction(id);
      if (res.success) {
        router.refresh();
      } else {
        setErrorMessage(res.error ?? "Failed to reject consultation request.");
      }
    });
  };

  const handleComplete = (id: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await completeConsultationAction(id);
      if (res.success) {
        router.refresh();
      } else {
        setErrorMessage(res.error ?? "Failed to complete consultation.");
      }
    });
  };

  const handleChat = () => {
    router.push("/messages");
  };

  return (
    <div className="space-y-6">
      
      {/* ── Dashboard Hero ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-600/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-pink-600/10 blur-3xl" />
        
        <div className="relative z-10 px-6 py-8 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/25">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Consultations</p>
              <h1 className="text-2xl font-black text-white sm:text-3xl mt-0.5">
                {isProfessional
                  ? (viewMode === "incoming" ? "Client Consultation Requests" : "Your Sent Consultations")
                  : "Your Consultation Requests"}
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                {isProfessional
                  ? (viewMode === "incoming"
                      ? "Manage incoming requests and advice requests from SocialGym members."
                      : "Track requests you sent to other trainers and registered dietitians.")
                  : "Track requests sent to trainers and registered dietitians."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── View Mode Selector (For Professionals only) ── */}
      {isProfessional && (
        <div className="flex gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setViewMode("incoming")}
            className={`flex-1 py-2.5 text-xs font-black rounded-lg transition ${
              viewMode === "incoming"
                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            📋 Requests Received (As Professional)
          </button>
          <button
            onClick={() => setViewMode("outgoing")}
            className={`flex-1 py-2.5 text-xs font-black rounded-lg transition ${
              viewMode === "outgoing"
                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            ✉️ Requests Sent (As Client)
          </button>
        </div>
      )}

      {/* ── Status Banner for Feedback ── */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/5 px-5 py-4 text-sm font-semibold text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* ── Sub Tabs ── */}
      <div className="flex border-b border-slate-800 pb-px">
        {[
          { key: "pending", label: "Pending", count: pending.length, color: "border-orange-500 text-orange-400 bg-orange-500/5" },
          { key: "active", label: "Active", count: active.length, color: "border-emerald-500 text-emerald-400 bg-emerald-500/5" },
          { key: "history", label: "History", count: history.length, color: "border-slate-500 text-slate-400 bg-slate-500/5" }
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-black border-b-2 transition ${
                isActive
                  ? `${tab.color} border-current`
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isActive ? "bg-white/10" : "bg-slate-800"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Requests Loop ── */}
      {activeList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 py-16 px-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-slate-500 mb-4 shadow">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-white">No consultations here</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed mt-1">
            {activeTab === "pending"
              ? "There are currently no pending consultation requests in this category."
              : activeTab === "active"
              ? "You do not have any active appointments or accepted consultation plans."
              : "Completed or rejected requests will appear in history."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {activeList.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow transition-all hover:border-slate-700 hover:bg-slate-900/80 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 flex items-center gap-1 uppercase">
                      <User className="h-3 w-3" />
                      {isProfessional && viewMode === "incoming"
                        ? `Client: ${item.partnerName}`
                        : `Professional: ${item.partnerName}`}
                    </span>
                    <h3 className="font-extrabold text-white text-base leading-snug mt-1.5">{item.topic}</h3>
                  </div>

                  {/* Status tags */}
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 ${
                    item.status === "PENDING"
                      ? "bg-orange-500/10 text-orange-400"
                      : item.status === "ACCEPTED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : item.status === "COMPLETED"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-red-500/10 text-red-400"
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Message */}
                <div className="rounded-xl bg-slate-950/40 p-3 border border-slate-850">
                  <p className="text-xs text-slate-300 leading-relaxed italic">&quot;{item.message}&quot;</p>
                </div>
              </div>

              {/* Footer controls & Info */}
              <div className="border-t border-slate-850 pt-4 mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[10px] text-slate-500 font-bold">
                  Received: {new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>

                <div className="flex gap-2">
                  {/* PENDING Controls for Professional (Incoming only) */}
                  {isProfessional && viewMode === "incoming" && item.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={isPending}
                        className="h-9 px-3 text-xs font-bold rounded-xl border border-red-900/30 bg-red-950/10 text-red-400 hover:bg-red-950/30 disabled:opacity-50 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAccept(item.id)}
                        disabled={isPending}
                        className="h-9 px-4 text-xs font-black rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow hover:opacity-90 disabled:opacity-50 transition"
                      >
                        Accept Request
                      </button>
                    </>
                  )}

                  {/* ACTIVE Controls */}
                  {item.status === "ACCEPTED" && (
                    <>
                      {isProfessional && viewMode === "incoming" && (
                        <button
                          onClick={() => handleComplete(item.id)}
                          disabled={isPending}
                          className="h-9 px-3.5 text-xs font-bold rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-850 disabled:opacity-50 transition"
                        >
                          Mark Completed
                        </button>
                      )}
                      <button
                        onClick={handleChat}
                        className="h-9 px-4 text-xs font-black rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow hover:opacity-95 flex items-center gap-1.5 transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Open Chat
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
