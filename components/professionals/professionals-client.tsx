"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Award,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Dumbbell,
  ExternalLink,
  Flame,
  Heart,
  Languages,
  Loader2,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import {
  type Professional,
  PROFESSIONALS,
  getFeatured,
  getCompatibilityScore,
} from "@/lib/professionals-data";
import { requestConsultationAction } from "@/lib/consultation-actions";

/* ─── Props ──────────────────────────────────────────────── */
type Props = {
  userGoals: string[];
};

/* ─── Tab types ──────────────────────────────────────────── */
type Tab = "all" | "trainers" | "dietitians" | "online" | "top";

/* ─── Helpers ────────────────────────────────────────────── */
function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-300"
          }`}
        />
      ))}
    </span>
  );
}

function OnlineBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
        isOnline
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isOnline ? "animate-pulse bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {isOnline ? "Online" : "In-Person"}
    </span>
  );
}

function compatGradient(score: number) {
  if (score >= 80) return "from-emerald-500 to-cyan-500";
  if (score >= 65) return "from-cyan-500 to-blue-500";
  return "from-violet-500 to-purple-600";
}

function roleColor(role: string) {
  return role === "TRAINER"
    ? "bg-violet-100 text-violet-700"
    : "bg-orange-100 text-orange-700";
}

function roleLabel(role: string) {
  return role === "TRAINER" ? "Personal Trainer" : "Dietitian";
}

/* ─── Consultation Modal ─────────────────────────────────── */
function ConsultationModal({
  pro,
  onClose,
}: {
  pro: Professional;
  onClose: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!topic.trim() || !message.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await requestConsultationAction(topic, message, pro.fullName);
      if (result.success) setDone(true);
      else setError(result.error ?? "Failed. Please try again.");
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-7 shadow-2xl">
        {done ? (
          <div className="text-center py-4">
            <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-white">Request Sent!</h3>
            <p className="mt-2 text-sm text-slate-400">
              Your consultation request has been sent to{" "}
              <span className="font-bold text-white">{pro.fullName}</span>. They
              will respond shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-6 h-10 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-bold text-white transition hover:opacity-90"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  Request Consultation
                </h3>
                <p className="text-sm text-slate-400">{pro.fullName}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
                  Topic
                </label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Fat loss program, Muscle building plan..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Tell them about your goals, experience level, schedule..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 resize-none"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 border border-red-500/20">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl border border-white/10 text-sm font-bold text-slate-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Request
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Profile Detail Modal ───────────────────────────────── */
function ProfileModal({
  pro,
  score,
  onClose,
  onConsult,
}: {
  pro: Professional;
  score: number;
  onClose: () => void;
  onConsult: () => void;
}) {
  const [profileTab, setProfileTab] = useState<
    "overview" | "schedule" | "reviews"
  >("overview");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
        {/* Banner */}
        <div className="relative h-44 sm:h-56 overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
          <Image
            src={pro.bannerImage}
            alt={pro.fullName}
            fill
            className="object-cover"
            sizes="768px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
          >
            <X className="h-4 w-4" />
          </button>
          {/* Avatar overlapping banner */}
          <div className="absolute -bottom-10 left-6 flex items-end gap-4">
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
              <Image
                src={pro.image}
                alt={pro.fullName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          </div>
          {pro.isPremium && (
            <div className="absolute right-4 bottom-4 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black text-amber-900 shadow">
              <Crown className="h-3 w-3" />
              PREMIUM
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pt-14 pb-6">
          {/* Name + role */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  {pro.fullName}
                </h2>
                {pro.isVerified && (
                  <BadgeCheck className="h-5 w-5 text-emerald-500" />
                )}
              </div>
              <p className="text-sm font-semibold text-slate-500">
                {pro.headline}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span
                  className={`rounded-full px-2 py-0.5 font-bold ${roleColor(pro.role)}`}
                >
                  {roleLabel(pro.role)}
                </span>
                <OnlineBadge isOnline={pro.isOnline} />
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {pro.district}, {pro.city}
                </span>
              </div>
            </div>

            {/* Score */}
            <div
              className={`flex flex-col items-center rounded-2xl bg-gradient-to-br ${compatGradient(score)} px-4 py-2.5 shadow`}
            >
              <span className="text-2xl font-black text-white">{score}</span>
              <span className="text-[10px] font-bold text-white/80">
                Match
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-4 gap-3">
            {[
              {
                label: "Rating",
                val: pro.rating.toFixed(1),
                icon: Star,
                color: "text-amber-500",
              },
              {
                label: "Reviews",
                val: pro.reviewsCount,
                icon: MessageCircle,
                color: "text-violet-500",
              },
              {
                label: "Experience",
                val: `${pro.yearsExperience}yr`,
                icon: Award,
                color: "text-cyan-500",
              },
              {
                label: "Clients",
                val: pro.clientsTotal,
                icon: Users,
                color: "text-emerald-500",
              },
            ].map(({ label, val, icon: Icon, color }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-xl bg-slate-50 py-3 text-center"
              >
                <Icon className={`h-4 w-4 ${color} mb-1`} />
                <span className="text-sm font-black text-slate-800">{val}</span>
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>

          {/* Gym / location */}
          {pro.gym && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-700">{pro.gym}</p>
                {pro.gymAddress && (
                  <p className="text-xs text-slate-500">{pro.gymAddress}</p>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mt-6 flex gap-1 rounded-xl bg-slate-100 p-1">
            {(["overview", "schedule", "reviews"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setProfileTab(t)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold capitalize transition ${
                  profileTab === t
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {profileTab === "overview" && (
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm leading-6 text-slate-600">{pro.bio}</p>
              </div>

              {/* Specialties */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
                  <Zap className="h-3.5 w-3.5" /> Specialties
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pro.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
                  <Award className="h-3.5 w-3.5" /> Certifications
                </p>
                <div className="space-y-1.5">
                  {pro.certifications.map((c) => (
                    <div
                      key={c}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
                  <Languages className="h-3.5 w-3.5" /> Languages
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pro.languages.map((l) => (
                    <span
                      key={l}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700 mb-1">
                  Session Pricing
                </p>
                <p className="text-3xl font-black text-emerald-800">
                  ₺{pro.sessionPrice.toLocaleString()}
                  <span className="text-base font-semibold text-emerald-600">
                    {" "}
                    / session
                  </span>
                </p>
                {pro.role === "TRAINER" && pro.transformations > 0 && (
                  <p className="mt-1 text-xs text-emerald-600">
                    🏆 {pro.transformations} successful transformations
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab: Schedule */}
          {profileTab === "schedule" && (
            <div className="mt-5">
              <p className="mb-4 text-sm text-slate-500">
                Available session slots this week
              </p>
              <div className="space-y-3">
                {pro.weeklyAvailability.map(({ day, slots }) => (
                  <div key={day} className="flex items-start gap-3">
                    <span className="w-9 shrink-0 rounded-lg bg-slate-100 py-1.5 text-center text-xs font-black text-slate-600">
                      {day}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {slots.map((slot) => (
                        <span
                          key={slot}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Reviews */}
          {profileTab === "reviews" && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="text-center">
                  <p className="text-4xl font-black text-slate-900">
                    {pro.rating.toFixed(1)}
                  </p>
                  <StarRating rating={pro.rating} />
                  <p className="mt-1 text-xs text-slate-500">
                    {pro.reviewsCount} reviews
                  </p>
                </div>
              </div>
              {pro.testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-800">
                      {t.author}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={t.rating} />
                      <span className="text-xs text-slate-400">{t.date}</span>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{t.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* CTA row */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onConsult}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-sm font-black text-white shadow-lg shadow-violet-500/30 transition hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Request Consultation
            </button>
            {pro.instagram && (
              <a
                href={`https://instagram.com/${pro.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-12 shrink-0 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 transition hover:bg-slate-50"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Professional Card ──────────────────────────────────── */
function ProCard({
  pro,
  score,
  favorited,
  onToggleFav,
  onView,
  onConsult,
}: {
  pro: Professional;
  score: number;
  favorited: boolean;
  onToggleFav: () => void;
  onView: () => void;
  onConsult: () => void;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 cursor-pointer"
      onClick={onView}
    >
      {/* Top accent gradient bar */}
      <div
        className={`h-1 w-full bg-gradient-to-r ${
          pro.role === "TRAINER"
            ? "from-violet-500 to-cyan-500"
            : "from-orange-500 to-amber-500"
        }`}
      />

      {/* Card image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={pro.image}
          alt={pro.fullName}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 380px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {pro.isPremium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-amber-900 shadow">
              <Crown className="h-2.5 w-2.5" />
              PREMIUM
            </span>
          )}
          {pro.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-black text-white shadow backdrop-blur-sm">
              <BadgeCheck className="h-2.5 w-2.5" />
              VERIFIED
            </span>
          )}
        </div>

        {/* Fav button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav();
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition hover:bg-black/50"
        >
          {favorited ? (
            <BookmarkCheck className="h-4 w-4 text-amber-400" />
          ) : (
            <Bookmark className="h-4 w-4 text-white" />
          )}
        </button>

        {/* Bottom overlay info */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-extrabold text-white text-base leading-tight">
                {pro.fullName}
              </h3>
              <p className="text-xs text-white/80">{pro.headline}</p>
            </div>
            {/* Compatibility score */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${compatGradient(score)} shadow`}
            >
              <span className="text-sm font-extrabold text-white">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${roleColor(pro.role)}`}
          >
            {roleLabel(pro.role)}
          </span>
          <OnlineBadge isOnline={pro.isOnline} />
          <span className="flex items-center gap-0.5 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            {pro.district}
          </span>
        </div>

        {/* Rating + Experience */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarRating rating={pro.rating} />
            <span className="text-xs font-bold text-slate-700">
              {pro.rating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">
              ({pro.reviewsCount})
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Award className="h-3 w-3" />
            {pro.yearsExperience} yr exp
          </span>
        </div>

        {/* Specialties (first 3) */}
        <div className="mt-3 flex flex-wrap gap-1">
          {pro.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600"
            >
              {s}
            </span>
          ))}
          {pro.specialties.length > 3 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500">
              +{pro.specialties.length - 3}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              per session
            </p>
            <p className="text-base font-extrabold text-slate-900">
              ₺{pro.sessionPrice.toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onConsult();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-xs font-black text-white shadow transition hover:opacity-90"
          >
            <Calendar className="h-3.5 w-3.5" />
            Consult
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Featured Carousel ──────────────────────────────────── */
function FeaturedCarousel({
  userGoals,
  onView,
  onConsult,
}: {
  userGoals: string[];
  onView: (p: Professional) => void;
  onConsult: (p: Professional) => void;
}) {
  const featured = useMemo(() => getFeatured(), []);
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + featured.length) % featured.length);
  const next = () => setCurrent((c) => (c + 1) % featured.length);

  const pro = featured[current];
  const score = getCompatibilityScore(userGoals, pro);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background */}
      <div className="relative h-56 sm:h-64">
        <Image
          src={pro.bannerImage}
          alt={pro.fullName}
          fill
          className="object-cover transition-all duration-500"
          sizes="1200px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center px-6 sm:px-10">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/30 shadow-xl">
              <Image
                src={pro.image}
                alt={pro.fullName}
                fill
                className="object-cover object-top"
                sizes="80px"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-amber-900">
                  ✦ TOP PICK FOR YOU
                </span>
                {pro.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-emerald-400" />
                )}
              </div>
              <h3 className="text-xl font-black text-white sm:text-2xl">
                {pro.fullName}
              </h3>
              <p className="text-sm text-white/70">{pro.headline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  <StarRating rating={pro.rating} />
                  <span className="text-sm font-bold text-white">
                    {pro.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-white/60">
                  {pro.yearsExperience}yr exp
                </span>
                <span className="text-xs text-white/60">
                  ₺{pro.sessionPrice.toLocaleString()}/session
                </span>
              </div>
            </div>

            {/* Match score */}
            <div className="hidden sm:flex shrink-0 flex-col items-center">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${compatGradient(score)} shadow-lg`}
              >
                <span className="text-xl font-extrabold text-white">{score}</span>
              </div>
              <span className="mt-1 text-[10px] text-white/60">Match</span>
            </div>
          </div>
        </div>

        {/* Nav buttons */}
        <button
          type="button"
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {featured.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* CTA bar */}
      <div className="bg-slate-900 px-6 py-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {pro.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onView(pro)}
            className="rounded-xl border border-white/20 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/10"
          >
            View Profile
          </button>
          <button
            type="button"
            onClick={() => onConsult(pro)}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
          >
            Consult
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ProfessionalsClient ───────────────────────────── */
export function ProfessionalsClient({ userGoals }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [consultPro, setConsultPro] = useState<Professional | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  function toggleFav(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    let list = PROFESSIONALS;

    // Tab filter
    if (activeTab === "trainers") list = list.filter((p) => p.role === "TRAINER");
    else if (activeTab === "dietitians") list = list.filter((p) => p.role === "DIETITIAN");
    else if (activeTab === "online") list = list.filter((p) => p.isOnline);
    else if (activeTab === "top") list = [...list].sort((a, b) => b.rating - a.rating).slice(0, 6);

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.headline.toLowerCase().includes(q) ||
          p.specialties.some((s) => s.toLowerCase().includes(q)) ||
          p.city.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q),
      );
    }

    // Sort by compatibility
    return [...list].sort(
      (a, b) =>
        getCompatibilityScore(userGoals, b) - getCompatibilityScore(userGoals, a),
    );
  }, [activeTab, search, userGoals]);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all", label: "All", count: PROFESSIONALS.length },
    { key: "trainers", label: "Trainers", count: PROFESSIONALS.filter((p) => p.role === "TRAINER").length },
    { key: "dietitians", label: "Dietitians", count: PROFESSIONALS.filter((p) => p.role === "DIETITIAN").length },
    { key: "online", label: "Online Available", count: PROFESSIONALS.filter((p) => p.isOnline).length },
    { key: "top", label: "Top Rated" },
  ];

  return (
    <>
      {/* ── Profile Modal ── */}
      {selectedPro && (
        <ProfileModal
          pro={selectedPro}
          score={getCompatibilityScore(userGoals, selectedPro)}
          onClose={() => setSelectedPro(null)}
          onConsult={() => {
            setConsultPro(selectedPro);
            setSelectedPro(null);
          }}
        />
      )}

      {/* ── Consultation Modal ── */}
      {consultPro && (
        <ConsultationModal
          pro={consultPro}
          onClose={() => setConsultPro(null)}
        />
      )}

      <div className="space-y-6">

        {/* ── Hero Banner ─────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-violet-950/70 to-slate-900/90" />

          {/* Blobs */}
          <div
            className="absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
          />
          <div
            className="absolute -bottom-20 left-10 h-56 w-56 rounded-full opacity-15 blur-3xl"
            style={{ background: "radial-gradient(circle, #10b981, transparent)" }}
          />

          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-300">
              <Sparkles className="h-3 w-3" />
              Verified Fitness Professionals
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Fitness Expert
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Browse certified trainers and registered dietitians. Every professional
              is verified. All matched to your goals.
            </p>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-6">
              {[
                { icon: User, val: "8", label: "Trainers" },
                { icon: Heart, val: "4", label: "Dietitians" },
                { icon: BadgeCheck, val: "100%", label: "Verified" },
              ].map(({ icon: Icon, val, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-white/70" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{val}</p>
                    <p className="text-[10px] text-slate-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Search bar */}
            <div className="mt-6 flex max-w-lg items-center gap-3 rounded-2xl border border-white/15 bg-white/8 px-4 py-2.5 backdrop-blur-sm">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, specialty, city..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Featured Carousel ───────────────────────────────── */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
              Featured & Recommended
            </h2>
          </div>
          <FeaturedCarousel
            userGoals={userGoals}
            onView={(p) => setSelectedPro(p)}
            onConsult={(p) => setConsultPro(p)}
          />
        </div>

        {/* ── Tab bar ─────────────────────────────────────────── */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                activeTab === key
                  ? "bg-violet-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
              {count !== undefined && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    activeTab === key
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Results summary ─────────────────────────────────── */}
        {search && (
          <p className="text-sm text-slate-500">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for{" "}
            <span className="font-bold text-slate-700">&ldquo;{search}&rdquo;</span>
          </p>
        )}

        {/* ── Professional Grid ────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
              <Dumbbell className="h-8 w-8 text-violet-400" />
            </div>
            <div>
              <p className="font-bold text-slate-700">No professionals found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try a different search term or tab.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setSearch(""); setActiveTab("all"); }}
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-600"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((pro) => (
              <ProCard
                key={pro.id}
                pro={pro}
                score={getCompatibilityScore(userGoals, pro)}
                favorited={favorites.has(pro.id)}
                onToggleFav={() => toggleFav(pro.id)}
                onView={() => setSelectedPro(pro)}
                onConsult={() => setConsultPro(pro)}
              />
            ))}
          </div>
        )}

        {/* ── How matching works ───────────────────────────────── */}
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-violet-800">
                How match scores work
              </p>
              <p className="mt-1 text-xs leading-5 text-violet-700">
                Each professional&apos;s match score (0–100) is calculated based on
                the overlap between your fitness goals and their listed specialties.
                Scores of 80+ indicate an excellent fit. Update your profile to
                improve your recommendations.
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
