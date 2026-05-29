"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/lib/matching-actions";
import {
  MessageCircle,
  Send,
  Search,
  Users,
  ChevronLeft,
  Clock,
  Dumbbell,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────── */
export type Conversation = {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  messages: {
    id: string;
    content: string;
    createdAt: string; // ISO string
    isFromMe: boolean;
    buddyMatchId: string | null;
  }[];
  lastMessageAt: string; // ISO string
  matchId: string | null;
};

type Props = {
  conversations: Conversation[];
  currentUserId: string;
};

/* ── Helpers ─────────────────────────────────────────────── */
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  } else {
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

function formatFullTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_GRADIENTS = [
  "from-emerald-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-orange-500 to-pink-500",
  "from-cyan-500 to-blue-500",
  "from-green-500 to-teal-500",
];

function avatarGradient(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length];
}

/* ── SendMessageForm ─────────────────────────────────────── */
function SendMessageForm({
  partnerId,
  matchId,
  onSent,
}: {
  partnerId: string;
  matchId: string | null;
  onSent: () => void;
}) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSend() {
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await sendMessageAction(
        partnerId,
        text.trim(),
        matchId ?? undefined
      );
      if (result.success) {
        setText("");
        onSent();
      } else {
        setError(result.error ?? "Failed to send.");
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="p-4 border-t border-white/10 bg-slate-900/60 backdrop-blur-sm">
      {error && (
        <p className="text-xs text-red-400 mb-2 px-1">{error}</p>
      )}
      <div className="flex items-end gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          disabled={isPending}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all min-h-[44px] max-h-32 overflow-y-auto"
          style={{ lineHeight: "1.5" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 128) + "px";
          }}
        />
        <button
          onClick={handleSend}
          disabled={isPending || !text.trim()}
          className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
          aria-label="Send message"
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-slate-600 mt-2 px-1">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}

/* ── Main MessagesClient ─────────────────────────────────── */
export function MessagesClient({ conversations, currentUserId }: Props) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(
    conversations[0]?.partnerId ?? null
  );
  const [search, setSearch] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.partnerId === activeId) ?? null;

  const filtered = conversations.filter(
    (c) =>
      c.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      c.partnerEmail.toLowerCase().includes(search.toLowerCase())
  );

  // Scroll to bottom when active conversation changes or new message
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, activeConv?.messages.length]);

  function handleSelectConv(partnerId: string) {
    setActiveId(partnerId);
    setMobileShowThread(true);
  }

  function handleSent() {
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Hero Header ───────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-600/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Messages</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {conversations.length === 0
                  ? "No conversations yet"
                  : `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            {activeConv?.matchId && (
              <div className="ml-auto flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Active Buddy Match</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────── */}
      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center mb-6 shadow-xl">
            <MessageCircle className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No messages yet</h2>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Connect with gym buddies on the{" "}
            <a href="/matches" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
              Matches page
            </a>{" "}
            and start a conversation.
          </p>
        </div>
      )}

      {/* ── Split layout ──────────────────────────────────── */}
      {conversations.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">

            {/* ── Conversation List (left sidebar) ────────── */}
            <div
              className={`
                flex flex-col w-full sm:w-80 lg:w-96 flex-shrink-0
                bg-slate-900/60 backdrop-blur rounded-2xl border border-white/8 overflow-hidden
                ${mobileShowThread ? "hidden sm:flex" : "flex"}
              `}
            >
              {/* Search */}
              <div className="p-3 border-b border-white/8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search conversations…"
                    className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 transition-colors"
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Users className="w-8 h-8 text-slate-600 mb-3" />
                    <p className="text-slate-500 text-sm">No conversations found</p>
                  </div>
                )}

                {filtered.map((conv) => {
                  const isActive = conv.partnerId === activeId;
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  const preview = lastMsg
                    ? (lastMsg.isFromMe ? "You: " : "") + lastMsg.content
                    : "No messages yet";

                  return (
                    <button
                      key={conv.partnerId}
                      onClick={() => handleSelectConv(conv.partnerId)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3.5 text-left
                        border-b border-white/5 transition-all
                        ${isActive
                          ? "bg-emerald-500/10 border-l-2 border-l-emerald-500"
                          : "hover:bg-white/5 border-l-2 border-l-transparent"
                        }
                      `}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradient(conv.partnerId)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}
                      >
                        {getInitials(conv.partnerName)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-semibold text-sm truncate ${isActive ? "text-emerald-300" : "text-white"}`}>
                            {conv.partnerName}
                          </span>
                          <span className="text-[10px] text-slate-500 flex-shrink-0">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {preview}
                        </p>
                        {conv.matchId && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5">
                            <Dumbbell className="w-2.5 h-2.5" />
                            Buddy
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Thread / Right Panel ─────────────────────── */}
            <div
              className={`
                flex-1 flex flex-col
                bg-slate-900/60 backdrop-blur rounded-2xl border border-white/8 overflow-hidden
                ${mobileShowThread ? "flex" : "hidden sm:flex"}
              `}
            >
              {activeConv ? (
                <>
                  {/* Thread Header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-slate-900/40">
                    {/* Mobile back button */}
                    <button
                      className="sm:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      onClick={() => setMobileShowThread(false)}
                      aria-label="Back to conversations"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(activeConv.partnerId)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md`}
                    >
                      {getInitials(activeConv.partnerName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{activeConv.partnerName}</p>
                      <p className="text-xs text-slate-500 truncate">{activeConv.partnerEmail}</p>
                    </div>
                    {activeConv.matchId && (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full">
                        <Dumbbell className="w-3 h-3" />
                        <span className="hidden sm:inline">Active Match</span>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {activeConv.messages.map((msg, i) => {
                      const prevMsg = activeConv.messages[i - 1];
                      const showDateSep =
                        !prevMsg ||
                        new Date(msg.createdAt).toDateString() !==
                          new Date(prevMsg.createdAt).toDateString();

                      return (
                        <div key={msg.id}>
                          {/* Date separator */}
                          {showDateSep && (
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 h-px bg-white/8" />
                              <span className="text-[10px] text-slate-600 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {new Date(msg.createdAt).toLocaleDateString([], {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <div className="flex-1 h-px bg-white/8" />
                            </div>
                          )}

                          {/* Bubble */}
                          <div
                            className={`flex ${msg.isFromMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`
                                max-w-[75%] group relative
                                ${msg.isFromMe ? "items-end" : "items-start"}
                              `}
                            >
                              <div
                                className={`
                                  rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
                                  ${msg.isFromMe
                                    ? "bg-gradient-to-br from-emerald-600 to-cyan-600 text-white rounded-br-sm"
                                    : "bg-white/8 border border-white/10 text-slate-200 rounded-bl-sm"
                                  }
                                `}
                              >
                                {msg.content}
                              </div>
                              <span
                                className={`
                                  text-[10px] text-slate-600 mt-1 px-1
                                  opacity-0 group-hover:opacity-100 transition-opacity
                                  ${msg.isFromMe ? "text-right block" : "text-left block"}
                                `}
                              >
                                {formatFullTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={threadEndRef} />
                  </div>

                  {/* Send form */}
                  <SendMessageForm
                    partnerId={activeConv.partnerId}
                    matchId={activeConv.matchId}
                    onSent={handleSent}
                  />
                </>
              ) : (
                /* No conversation selected (desktop fallback) */
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">Select a conversation</p>
                    <p className="text-slate-600 text-sm mt-1">
                      Choose a conversation from the left to read and reply.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
