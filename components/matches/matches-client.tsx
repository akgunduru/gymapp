"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Send,
  Sparkles,
  Star,
  Target,
  UserCheck,
  Users,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  acceptMatchRequestAction,
  sendMatchRequestAction,
  sendMessageAction,
} from "@/lib/matching-actions";

/* ─── Types ──────────────────────────────────────────────── */
export type BuddyRequestStatus =
  | { type: "none" }
  | { type: "sent"; requestId: string; status: string }
  | { type: "received"; requestId: string; status: string }
  | { type: "matched"; matchId: string };

export type BuddyProfile = {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  bio: string | null;
  city: string | null;
  district: string | null;
  level: string | null;
  goals: string[];
  muscleGroups: string[];
  weeklyWorkoutDays: number;
  score: number;
  reasons: string[];
  distanceKm: number | null;
  requestStatus: BuddyRequestStatus;
  matchId: string | null;
};

type MatchesClientProps = {
  buddies: BuddyProfile[];
  currentUserId: string;
};

type MatchTab = "best" | "nearby" | "pending" | "active";

/* ─── Label maps ─────────────────────────────────────────── */
const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const GOAL_LABELS: Record<string, string> = {
  LOSE_WEIGHT: "Fat loss",
  BUILD_MUSCLE: "Muscle gain",
  STRENGTH: "Strength",
  HEALTH: "Health",
};

const MUSCLE_LABELS: Record<string, string> = {
  CHEST: "Chest",
  BACK: "Back",
  LEGS: "Legs",
  SHOULDERS: "Shoulders",
  ARMS: "Arms",
  CORE: "Core",
  CARDIO: "Cardio",
  FULL_BODY: "Full body",
};

/* ─── Display helpers ────────────────────────────────────── */
function scoreGradient(score: number) {
  if (score >= 80) return "from-emerald-500 to-cyan-500";
  if (score >= 60) return "from-sky-500 to-blue-500";
  if (score >= 40) return "from-violet-500 to-fuchsia-500";
  return "from-slate-400 to-slate-500";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Strong";
  if (score >= 40) return "Good";
  return "Light";
}

function displayNameFor(buddy: BuddyProfile) {
  return buddy.fullName ?? buddy.email.split("@")[0];
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDistance(distanceKm: number | null) {
  if (distanceKm === null) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
}

function statusCopy(status: BuddyRequestStatus) {
  if (status.type === "matched") return "Active match";
  if (status.type === "sent" && status.status === "PENDING") return "Request sent";
  if (status.type === "received" && status.status === "PENDING") return "Request received";
  if (status.type === "sent" && status.status === "ACCEPTED") return "Accepted";
  if (status.type === "received" && status.status === "ACCEPTED") return "Accepted";
  return "Available";
}

function isPendingRequest(buddy: BuddyProfile) {
  return (
    (buddy.requestStatus.type === "sent" && buddy.requestStatus.status === "PENDING") ||
    (buddy.requestStatus.type === "received" && buddy.requestStatus.status === "PENDING")
  );
}

function isNearby(buddy: BuddyProfile) {
  return buddy.distanceKm !== null && buddy.distanceKm <= 8;
}

function chipList(values: string[], labels: Record<string, string>, limit = 3) {
  const visible = values.slice(0, limit);
  const extra = Math.max(0, values.length - visible.length);

  return {
    visible: visible.map((value) => labels[value] ?? value),
    extra,
  };
}

/* ─── Message form ───────────────────────────────────────── */
function MessageComposer({
  receiverId,
  matchId,
  onSent,
}: {
  receiverId: string;
  matchId: string;
  onSent: () => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setError("");
    startTransition(async () => {
      const result = await sendMessageAction(receiverId, trimmed, matchId);
      if (result.success) {
        setText("");
        router.refresh();
        onSent();
      } else {
        setError(result.error ?? "Message could not be saved.");
      }
    });
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !isPending) handleSend();
          }}
          placeholder="Write a short message"
          maxLength={280}
          disabled={isPending}
          className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !text.trim()}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 text-xs font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

/* ─── Individual buddy card ──────────────────────────────── */
function BuddyCard({ buddy }: { buddy: BuddyProfile }) {
  const [expanded, setExpanded] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [actionError, setActionError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const displayName = displayNameFor(buddy);
  const initials = initialsFor(displayName);
  const goals = chipList(buddy.goals, GOAL_LABELS);
  const muscles = chipList(buddy.muscleGroups, MUSCLE_LABELS);
  const distance = formatDistance(buddy.distanceKm);
  const visibleReasons = expanded ? buddy.reasons : buddy.reasons.slice(0, 4);
  const hasMoreReasons = buddy.reasons.length > visibleReasons.length;
  const requestStatus = buddy.requestStatus;

  function handleSendRequest() {
    setActionError("");
    startTransition(async () => {
      const result = await sendMatchRequestAction(buddy.id);
      if (result.success) {
        router.refresh();
      } else {
        setActionError(result.error ?? "Request could not be sent.");
      }
    });
  }

  function handleAccept() {
    if (requestStatus.type !== "received") return;

    setActionError("");
    startTransition(async () => {
      const result = await acceptMatchRequestAction(requestStatus.requestId);
      if (result.success) {
        router.refresh();
      } else {
        setActionError(result.error ?? "Request could not be accepted.");
      }
    });
  }

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`h-1.5 bg-gradient-to-r ${scoreGradient(buddy.score)}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${scoreGradient(buddy.score)} text-lg font-extrabold text-white shadow-sm`}>
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-extrabold text-slate-950">{displayName}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {statusCopy(requestStatus)}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
              {(buddy.city || buddy.district) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  {[buddy.district, buddy.city].filter(Boolean).join(", ")}
                </span>
              )}
              {buddy.level && (
                <span className="inline-flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-violet-500" />
                  {LEVEL_LABELS[buddy.level] ?? buddy.level}
                </span>
              )}
              {distance && (
                <span className="inline-flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5 text-cyan-500" />
                  {distance}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className={`inline-flex min-w-14 justify-center rounded-lg bg-gradient-to-br ${scoreGradient(buddy.score)} px-3 py-2 text-lg font-extrabold text-white shadow-sm`}>
              {buddy.score}
            </div>
            <p className="mt-1 text-xs font-bold text-slate-400">/100 {scoreLabel(buddy.score)}</p>
          </div>
        </div>

        {buddy.bio && <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{buddy.bio}</p>}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-2 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-slate-400">
              <Target className="h-3.5 w-3.5" />
              Goals
            </p>
            <div className="flex flex-wrap gap-1.5">
              {goals.visible.length > 0 ? (
                <>
                  {goals.visible.map((goal) => (
                    <span key={goal} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                      {goal}
                    </span>
                  ))}
                  {goals.extra > 0 && (
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                      +{goals.extra}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs font-semibold text-slate-400">Not set</span>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-slate-400">
              <Dumbbell className="h-3.5 w-3.5" />
              Focus
            </p>
            <div className="flex flex-wrap gap-1.5">
              {muscles.visible.length > 0 ? (
                <>
                  {muscles.visible.map((muscle) => (
                    <span key={muscle} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                      {muscle}
                    </span>
                  ))}
                  {muscles.extra > 0 && (
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                      +{muscles.extra}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs font-semibold text-slate-400">Not set</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
            {buddy.weeklyWorkoutDays || 0} days/week
          </span>
          {requestStatus.type === "received" && requestStatus.status === "PENDING" && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">
              <Clock className="h-3.5 w-3.5" />
              Waiting for your response
            </span>
          )}
        </div>

        {visibleReasons.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {visibleReasons.map((reason) => (
              <span key={reason} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {reason}
              </span>
            ))}
            {hasMoreReasons && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
              >
                +{buddy.reasons.length - visibleReasons.length} more
              </button>
            )}
          </div>
        )}

        {expanded && (
          <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">All goals</p>
                <p className="mt-1 font-semibold">
                  {buddy.goals.map((goal) => GOAL_LABELS[goal] ?? goal).join(", ") || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">All focus areas</p>
                <p className="mt-1 font-semibold">
                  {buddy.muscleGroups.map((muscle) => MUSCLE_LABELS[muscle] ?? muscle).join(", ") || "Not set"}
                </p>
              </div>
            </div>
          </div>
        )}

        {actionError && (
          <p className="mt-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
            {actionError}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Details
          </button>

          {requestStatus.type === "none" && (
            <button
              type="button"
              onClick={handleSendRequest}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />}
              Send request
            </button>
          )}

          {requestStatus.type === "sent" && requestStatus.status === "PENDING" && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-extrabold text-violet-700">
              <Clock className="h-3.5 w-3.5" />
              Pending
            </span>
          )}

          {requestStatus.type === "received" && requestStatus.status === "PENDING" && (
            <button
              type="button"
              onClick={handleAccept}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
              Accept
            </button>
          )}

          {requestStatus.type === "matched" && (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700">
                <Heart className="h-3.5 w-3.5" />
                Matched
              </span>
              <button
                type="button"
                onClick={() => {
                  setMessageOpen((value) => !value);
                  setMessageSent(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:opacity-90"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Message
              </button>
            </>
          )}
        </div>

        {requestStatus.type === "matched" && messageOpen && (
          messageSent ? (
            <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              Message saved to your conversation.
            </div>
          ) : (
            <MessageComposer
              receiverId={buddy.id}
              matchId={requestStatus.matchId}
              onSent={() => setMessageSent(true)}
            />
          )
        )}
      </div>
    </article>
  );
}

/* ─── Main MatchesClient ─────────────────────────────────── */
export function MatchesClient({ buddies }: MatchesClientProps) {
  const [activeTab, setActiveTab] = useState<MatchTab>("best");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedBuddies = useMemo(
    () =>
      [...buddies].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY);
      }),
    [buddies],
  );

  const activeMatches = sortedBuddies.filter((buddy) => buddy.requestStatus.type === "matched");
  const pendingRequests = sortedBuddies.filter(isPendingRequest);
  const nearbyBuddies = sortedBuddies
    .filter(isNearby)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  const averageScore =
    buddies.length > 0
      ? Math.round(buddies.reduce((total, buddy) => total + buddy.score, 0) / buddies.length)
      : 0;

  const visibleBuddies = (() => {
    let list = sortedBuddies;
    if (activeTab === "nearby") list = nearbyBuddies;
    else if (activeTab === "pending") list = pendingRequests;
    else if (activeTab === "active") list = activeMatches;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (buddy) =>
          (buddy.fullName?.toLowerCase() || "").includes(q) ||
          buddy.email.toLowerCase().includes(q) ||
          (buddy.bio?.toLowerCase() || "").includes(q) ||
          (buddy.city?.toLowerCase() || "").includes(q) ||
          (buddy.district?.toLowerCase() || "").includes(q)
      );
    }
    return list;
  })();

  const tabs: Array<{
    id: MatchTab;
    label: string;
    count: number;
    icon: LucideIcon;
  }> = [
    { id: "best", label: "Best matches", count: sortedBuddies.length, icon: Sparkles },
    { id: "nearby", label: "Nearby", count: nearbyBuddies.length, icon: Navigation },
    { id: "pending", label: "Pending requests", count: pendingRequests.length, icon: Clock },
    { id: "active", label: "Active matches", count: activeMatches.length, icon: Heart },
  ];

  const stats = [
    { label: "Candidates", value: buddies.length, icon: Users, color: "from-violet-500 to-fuchsia-500" },
    { label: "Active", value: activeMatches.length, icon: Heart, color: "from-emerald-500 to-teal-500" },
    { label: "Pending", value: pendingRequests.length, icon: Clock, color: "from-amber-500 to-orange-500" },
    { label: "Avg score", value: averageScore, icon: Star, color: "from-sky-500 to-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg bg-slate-950 text-white shadow-lg">
        <div className="bg-gradient-to-br from-slate-950 via-violet-950 to-cyan-950 px-5 py-7 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                PostgreSQL buddy matching
              </div>
              <h1 className="text-3xl font-extrabold tracking-normal sm:text-4xl">Find Your Gym Buddy</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Ankara members ranked by training level, goals, focus areas, location, and weekly routine.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/10 p-3">
                  <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br ${color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-2xl font-extrabold">{value}</p>
                  <p className="text-xs font-semibold text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Search Bar ── */}
      <div className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex items-center">
        <Search className="absolute left-6 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search buddies by name, email, bio or location (city/district)..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-400 focus:bg-white transition-all text-slate-800"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-6 text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
              activeTab === id
                ? "border-violet-200 bg-violet-50 text-violet-900 shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="inline-flex items-center gap-2 text-sm font-extrabold">
              <Icon className="h-4 w-4" />
              {label}
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-extrabold text-slate-700 shadow-sm">
              {count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        {[
          { label: "80-100 Excellent", grad: "from-emerald-500 to-cyan-500" },
          { label: "60-79 Strong", grad: "from-sky-500 to-blue-500" },
          { label: "40-59 Good", grad: "from-violet-500 to-fuchsia-500" },
          { label: "0-39 Light", grad: "from-slate-400 to-slate-500" },
        ].map(({ label, grad }) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <span className={`h-3 w-3 rounded-full bg-gradient-to-br ${grad}`} />
            {label}
          </span>
        ))}
      </div>

      {buddies.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-violet-50">
            <Users className="h-7 w-7 text-violet-500" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-800">Run seed data to populate demo users.</p>
            <p className="mt-1 text-sm text-slate-500">The buddy matching page needs seeded user profiles to display candidates.</p>
          </div>
        </div>
      ) : visibleBuddies.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="font-extrabold text-slate-800">No profiles in this section yet.</p>
          <p className="mt-1 text-sm text-slate-500">Best matches still shows every available buddy candidate.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleBuddies.map((buddy) => (
            <BuddyCard key={buddy.id} buddy={buddy} />
          ))}
        </div>
      )}
    </div>
  );
}
