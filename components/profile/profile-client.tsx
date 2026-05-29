"use client";

import { useState, useEffect, useRef, useTransition, useMemo } from "react";
import {
  Activity,
  Apple,
  Award,
  BadgeCheck,
  Brain,
  Calendar,
  Camera,
  ChevronRight,
  Dumbbell,
  Flame,
  Heart,
  Loader2,
  MapPin,
  Pencil,
  Save,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import {
  FITNESS_GOAL_LABELS,
  FITNESS_GOALS,
  FITNESS_LEVEL_LABELS,
  FITNESS_LEVELS,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUPS,
  type FitnessGoalValue,
  type MuscleGroupValue,
} from "@/lib/constants";
import { updateProfileAction } from "@/lib/profile-actions";

/* ─── Props (all data from server component) ─────────────── */
export type ProfileClientProps = {
  email: string;
  role: string;
  fullName: string;
  bio: string;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  level: string;
  weeklyWorkoutDays: number;
  goals: string[];
  preferredMuscleGroups: string[];
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbGoal: number;
  dailyFatGoal: number;
  updated: boolean;
  error: string | null;
};

/* ─── Goal icons & colors ────────────────────────────────── */
const GOAL_META: Record<string, { icon: string; gradient: string; bg: string; text: string }> = {
  LOSE_WEIGHT:  { icon: "🔥", gradient: "from-orange-500 to-amber-500",  bg: "bg-orange-50",  text: "text-orange-700" },
  BUILD_MUSCLE: { icon: "💪", gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50",  text: "text-violet-700" },
  STRENGTH:     { icon: "⚡", gradient: "from-cyan-500 to-blue-600",     bg: "bg-cyan-50",    text: "text-cyan-700"   },
  HEALTH:       { icon: "❤️", gradient: "from-emerald-500 to-teal-500",  bg: "bg-emerald-50", text: "text-emerald-700" },
};

const MUSCLE_META: Record<string, { icon: string; bg: string; text: string }> = {
  CHEST:     { icon: "🫁", bg: "bg-rose-50",    text: "text-rose-700"    },
  BACK:      { icon: "🦾", bg: "bg-indigo-50",  text: "text-indigo-700"  },
  LEGS:      { icon: "🦵", bg: "bg-amber-50",   text: "text-amber-700"   },
  SHOULDERS: { icon: "🏋️", bg: "bg-cyan-50",    text: "text-cyan-700"    },
  ARMS:      { icon: "💪", bg: "bg-violet-50",  text: "text-violet-700"  },
  CORE:      { icon: "⭕", bg: "bg-emerald-50", text: "text-emerald-700" },
  CARDIO:    { icon: "🏃", bg: "bg-orange-50",  text: "text-orange-700"  },
  FULL_BODY: { icon: "⚡", bg: "bg-slate-100",  text: "text-slate-700"   },
};

const LEVEL_META: Record<string, { label: string; color: string; stars: number }> = {
  BEGINNER:     { label: "Beginner",     color: "from-emerald-400 to-teal-500",  stars: 1 },
  INTERMEDIATE: { label: "Intermediate", color: "from-cyan-500 to-blue-500",     stars: 2 },
  ADVANCED:     { label: "Advanced",     color: "from-violet-500 to-purple-600", stars: 3 },
};

/* ─── Profile completion calculator ─────────────────────── */
function calcCompletion(p: {
  fullName: string; bio: string; city: string; district: string;
  goals: string[]; level: string; muscles: string[];
  weeklyDays: number; calories: number; protein: number;
}): number {
  let score = 0;
  if (p.fullName.trim()) score += 15;
  if (p.bio.trim()) score += 10;
  if (p.city.trim()) score += 10;
  if (p.district.trim()) score += 10;
  if (p.goals.length > 0) score += 20;
  if (p.level) score += 10;
  if (p.muscles.length > 0) score += 10;
  if (p.weeklyDays > 0) score += 5;
  if (p.calories > 0) score += 5;
  if (p.protein > 0) score += 5;
  return Math.min(score, 100);
}

/* ─── Completion ring SVG ────────────────────────────────── */
function CompletionRing({ pct }: { pct: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="url(#ring-grad)" strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Insight card ───────────────────────────────────────── */
function InsightCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-xl transition group-hover:opacity-20`} />
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>
    </div>
  );
}

/* ─── Field input ─────────────────────────────────────────── */
const fieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:opacity-50";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5";

/* ─── Main component ─────────────────────────────────────── */
export function ProfileClient(props: ProfileClientProps) {
  const {
    email, role,
    updated, error,
  } = props;

  /* ── Client-side mutable state ──────────────────────────── */
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>(props.goals);
  const [muscles, setMuscles] = useState<string[]>(props.preferredMuscleGroups);
  const [level, setLevel] = useState(props.level);
  const [weeklyDays, setWeeklyDays] = useState(props.weeklyWorkoutDays);
  const [calories, setCalories] = useState(props.dailyCalorieGoal);
  const [protein, setProtein] = useState(props.dailyProteinGoal);
  const [fullName, setFullName] = useState(props.fullName);
  const [bio, setBio] = useState(props.bio);
  const [city, setCity] = useState(props.city);
  const [district, setDistrict] = useState(props.district);
  const [showSuccess, setShowSuccess] = useState(updated);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  /* Load avatar from localStorage on mount */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sg-profile-avatar");
      if (saved) setAvatarSrc(saved);
    } catch { /* ignore */ }
  }, []);

  /* Auto-dismiss success banner */
  useEffect(() => {
    if (!updated) return;
    const t = setTimeout(() => setShowSuccess(false), 4000);
    return () => clearTimeout(t);
  }, [updated]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setAvatarSrc(src);
      try { localStorage.setItem("sg-profile-avatar", src); } catch { /* ignore */ }
    };
    reader.readAsDataURL(file);
  }

  function toggleGoal(g: string) {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  }

  function toggleMuscle(m: string) {
    setMuscles((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  }

  /* ── Derived values ─────────────────────────────────────── */
  const completion = useMemo(
    () => calcCompletion({ fullName, bio, city, district, goals, level, muscles, weeklyDays, calories, protein }),
    [fullName, bio, city, district, goals, level, muscles, weeklyDays, calories, protein],
  );

  const levelMeta = LEVEL_META[level] ?? LEVEL_META.BEGINNER;

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  /* Mock insight calculations */
  const consistencyScore = Math.round((weeklyDays / 7) * 100);
  const buddyReadiness = goals.length > 0 && city.trim() ? Math.min(70 + goals.length * 10, 98) : 40;
  const nutritionBalance = protein > 0 && calories > 0 ? Math.min(Math.round((protein * 4 / calories) * 100 * 3), 95) : 50;
  const aiReadiness = goals.length > 0 && muscles.length > 0 ? Math.min(60 + muscles.length * 5 + goals.length * 5, 99) : 45;

  /* Achievement badges */
  const badges: { label: string; icon: string; color: string }[] = [];
  if (goals.includes("BUILD_MUSCLE")) badges.push({ label: "Muscle Builder", icon: "💪", color: "bg-violet-100 text-violet-700" });
  if (goals.includes("STRENGTH")) badges.push({ label: "Strength Athlete", icon: "⚡", color: "bg-cyan-100 text-cyan-700" });
  if (goals.includes("LOSE_WEIGHT")) badges.push({ label: "Fat Burner", icon: "🔥", color: "bg-orange-100 text-orange-700" });
  if (goals.includes("HEALTH")) badges.push({ label: "Health First", icon: "❤️", color: "bg-emerald-100 text-emerald-700" });
  if (level === "ADVANCED") badges.push({ label: "Elite Athlete", icon: "🏆", color: "bg-amber-100 text-amber-700" });
  if (weeklyDays >= 5) badges.push({ label: "Dedicated", icon: "🎯", color: "bg-pink-100 text-pink-700" });
  if (weeklyDays >= 3 && weeklyDays < 5) badges.push({ label: "Consistent", icon: "📅", color: "bg-slate-100 text-slate-700" });

  return (
    <div className="space-y-6">

      {/* ── Success toast ────────────────────────────────────── */}
      {showSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-5 py-4 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 shadow">
            <BadgeCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Profile saved successfully!</p>
            <p className="text-xs text-emerald-600">Your preferences power matching, workouts, and nutrition.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* ── HERO SECTION ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900" />
        <div
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
        />
        <div
          className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #10b981, transparent)" }}
        />
        <div
          className="absolute top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full opacity-10 blur-2xl"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
        />

        <div className="relative z-10 px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">

            {/* Avatar section */}
            <div className="relative shrink-0">
              {/* Completion ring */}
              <div className="absolute inset-0 -m-2 h-[calc(100%+16px)] w-[calc(100%+16px)]">
                <CompletionRing pct={completion} />
              </div>

              {/* Avatar circle */}
              <div className="relative h-24 w-24 sm:h-28 sm:w-28">
                <div className="h-full w-full overflow-hidden rounded-full border-2 border-white/20 bg-gradient-to-br from-violet-500 to-cyan-500 shadow-xl shadow-violet-500/30">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Upload overlay */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg transition hover:scale-110"
                  title="Upload photo"
                >
                  <Camera className="h-3.5 w-3.5 text-white" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Completion % */}
              <div className="mt-2 text-center">
                <span className="text-[10px] font-bold text-white/60">{completion}% complete</span>
              </div>
            </div>

            {/* Name + stats */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-black text-white sm:text-3xl">
                  {fullName || "Your Name"}
                </h1>
                {completion >= 80 && (
                  <BadgeCheck className="h-6 w-6 text-emerald-400" />
                )}
              </div>

              {/* Badges row */}
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${levelMeta.color} px-2.5 py-1 text-[10px] font-black text-white shadow`}>
                  <Star className="h-2.5 w-2.5" />
                  {levelMeta.label}
                </span>
                {city && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur-sm">
                    <MapPin className="h-2.5 w-2.5" />
                    {district ? `${district}, ` : ""}{city}
                  </span>
                )}
                {weeklyDays >= 5 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 text-[10px] font-bold text-amber-300">
                    🔥 {weeklyDays}× / week
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 backdrop-blur-sm capitalize">
                  <User className="h-2.5 w-2.5" />
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </span>
              </div>

              {/* Bio preview */}
              {bio && (
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-300 line-clamp-2">
                  {bio}
                </p>
              )}

              {/* Goal chips */}
              {goals.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                  {goals.map((g) => {
                    const m = GOAL_META[g];
                    if (!m) return null;
                    return (
                      <span key={g} className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${m.gradient} px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm`}>
                        {m.icon} {FITNESS_GOAL_LABELS[g as FitnessGoalValue]}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stats column */}
            <div className="hidden lg:flex shrink-0 flex-col gap-2">
              {[
                { label: "Buddy Readiness", val: `${buddyReadiness}%`, icon: Users, color: "text-violet-300" },
                { label: "Workout Days", val: `${weeklyDays}/wk`, icon: Calendar, color: "text-emerald-300" },
                { label: "Daily Calories", val: calories.toLocaleString(), icon: Flame, color: "text-orange-300" },
              ].map(({ label, val, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-2.5 backdrop-blur-sm">
                  <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-black text-white">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Achievement Badges ───────────────────────────────── */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map(({ label, icon, color }) => (
            <span key={label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${color} border border-current/10 shadow-sm`}>
              {icon} {label}
            </span>
          ))}
        </div>
      )}

      {/* ── Fitness Insights Grid ────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-violet-500" />
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">Fitness Insights</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <InsightCard
            icon={Calendar}
            label="Consistency"
            value={`${consistencyScore}%`}
            sub={`${weeklyDays} sessions/wk`}
            gradient="from-emerald-500 to-teal-500"
          />
          <InsightCard
            icon={Flame}
            label="Calorie Target"
            value={calories.toLocaleString()}
            sub="kcal per day"
            gradient="from-orange-500 to-amber-500"
          />
          <InsightCard
            icon={Users}
            label="Buddy Readiness"
            value={`${buddyReadiness}%`}
            sub={goals.length > 0 ? "Goals set ✓" : "Set your goals"}
            gradient="from-violet-500 to-purple-600"
          />
          <InsightCard
            icon={Brain}
            label="AI Readiness"
            value={`${aiReadiness}%`}
            sub={muscles.length > 0 ? "Preferences set ✓" : "Set muscle groups"}
            gradient="from-cyan-500 to-blue-500"
          />
          <InsightCard
            icon={Apple}
            label="Nutrition Balance"
            value={`${nutritionBalance}%`}
            sub="Protein ratio score"
            gradient="from-pink-500 to-rose-500"
          />
          <InsightCard
            icon={Activity}
            label="Profile Score"
            value={`${completion}%`}
            sub={completion >= 80 ? "Great profile!" : "Keep filling in"}
            gradient="from-amber-500 to-orange-500"
          />
        </div>
      </div>

      {/* ── FORM ─────────────────────────────────────────────── */}
      <form action={updateProfileAction} className="grid gap-5 xl:grid-cols-[1fr_360px]">

        {/* Left column */}
        <div className="space-y-5">

          {/* ── Basic Information ─────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">Basic Information</h3>
                <p className="text-xs text-slate-500">Your identity on Social Gym</p>
              </div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="fullName" className={labelClass}>Full Name</label>
                <input
                  id="fullName" name="fullName" required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={fieldClass}
                  placeholder="Your full name"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="bio" className={labelClass}>Bio</label>
                <textarea
                  id="bio" name="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Training habits, goals, schedule, or anything useful for matches."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 resize-none"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input value={email} disabled className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <input value={role} disabled className={fieldClass} />
              </div>
            </div>
          </div>

          {/* ── Fitness Preferences ───────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">Fitness Preferences</h3>
                <p className="text-xs text-slate-500">Powers your workout & buddy recommendations</p>
              </div>
            </div>
            <div className="space-y-6 p-6">

              {/* Level + Days row */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="level" className={labelClass}>Fitness Level</label>
                  <select
                    id="level" name="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className={fieldClass}
                  >
                    {FITNESS_LEVELS.map((l) => (
                      <option key={l} value={l}>{FITNESS_LEVEL_LABELS[l]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="weeklyWorkoutDays" className={labelClass}>Weekly Workout Days</label>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5,6,7].map((d) => (
                      <button
                        key={d} type="button"
                        onClick={() => setWeeklyDays(d)}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-black transition ${
                          weeklyDays === d
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow"
                            : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  {/* Hidden input carries the value */}
                  <input type="hidden" name="weeklyWorkoutDays" value={weeklyDays} />
                </div>
              </div>

              {/* Goals — visual chip toggles */}
              <div>
                <label className={labelClass}>Goals</label>
                <div className="grid grid-cols-2 gap-2">
                  {FITNESS_GOALS.map((goal) => {
                    const meta = GOAL_META[goal];
                    const active = goals.includes(goal);
                    return (
                      <button
                        key={goal} type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                          active
                            ? `border-transparent bg-gradient-to-r ${meta.gradient} text-white shadow-md`
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-base">{meta.icon}</span>
                        {FITNESS_GOAL_LABELS[goal as FitnessGoalValue]}
                      </button>
                    );
                  })}
                </div>
                {/* Hidden checkboxes for form submission */}
                {goals.map((g) => (
                  <input key={g} type="hidden" name="goals" value={g} />
                ))}
              </div>

              {/* Muscle groups — chip toggles */}
              <div>
                <label className={labelClass}>Preferred Muscle Groups</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {MUSCLE_GROUPS.map((group) => {
                    const meta = MUSCLE_META[group];
                    const active = muscles.includes(group);
                    return (
                      <button
                        key={group} type="button"
                        onClick={() => toggleMuscle(group)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                          active
                            ? `border-transparent ${meta.bg} ${meta.text} shadow-sm ring-1 ring-current/20`
                            : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <span>{meta.icon}</span>
                        {MUSCLE_GROUP_LABELS[group as MuscleGroupValue]}
                      </button>
                    );
                  })}
                </div>
                {/* Hidden inputs for form submission */}
                {muscles.map((m) => (
                  <input key={m} type="hidden" name="preferredMuscleGroups" value={m} />
                ))}
              </div>

            </div>
          </div>

          {/* ── Location ──────────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">Location</h3>
                <p className="text-xs text-slate-500">Used for gym discovery and nearby buddies</p>
              </div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label htmlFor="city" className={labelClass}>City</label>
                <input
                  id="city" name="city" required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={fieldClass} placeholder="Istanbul"
                />
              </div>
              <div>
                <label htmlFor="district" className={labelClass}>District</label>
                <input
                  id="district" name="district" required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className={fieldClass} placeholder="Beşiktaş"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className={labelClass}>Address Note</label>
                <input
                  id="address" name="address"
                  defaultValue={props.address}
                  className={fieldClass} placeholder="Optional, kept private."
                />
              </div>
              <div>
                <label htmlFor="latitude" className={labelClass}>Latitude</label>
                <input
                  id="latitude" name="latitude" type="number" step="0.000001" required
                  defaultValue={props.latitude}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="longitude" className={labelClass}>Longitude</label>
                <input
                  id="longitude" name="longitude" type="number" step="0.000001" required
                  defaultValue={props.longitude}
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* ── Nutrition Goals ───────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow">
                <Utensils className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">Nutrition Goals</h3>
                <p className="text-xs text-slate-500">Daily macro targets</p>
              </div>
            </div>
            <div className="space-y-4 p-6">
              {/* Macro visual bars */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[
                  { label: "Cal", val: calories, max: 4000, color: "from-orange-400 to-amber-500" },
                  { label: "Pro", val: protein, max: 300, color: "from-violet-500 to-purple-500" },
                  { label: "Carb", val: props.dailyCarbGoal, max: 500, color: "from-cyan-400 to-blue-500" },
                  { label: "Fat", val: props.dailyFatGoal, max: 200, color: "from-pink-400 to-rose-500" },
                ].map(({ label, val, max, color }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className="relative h-20 w-full overflow-hidden rounded-xl bg-slate-100">
                      <div
                        className={`absolute bottom-0 left-0 right-0 rounded-xl bg-gradient-to-t ${color} transition-all`}
                        style={{ height: `${Math.min((val / max) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{label}</span>
                    <span className="text-xs font-black text-slate-800">{val}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="dailyCalorieGoal" className={labelClass}>
                    Calories <span className="text-orange-500">kcal</span>
                  </label>
                  <input
                    id="dailyCalorieGoal" name="dailyCalorieGoal" type="number" required
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="dailyProteinGoal" className={labelClass}>
                    Protein <span className="text-violet-500">g</span>
                  </label>
                  <input
                    id="dailyProteinGoal" name="dailyProteinGoal" type="number" required
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="dailyCarbGoal" className={labelClass}>
                    Carbohydrates <span className="text-cyan-500">g</span>
                  </label>
                  <input
                    id="dailyCarbGoal" name="dailyCarbGoal" type="number" required
                    defaultValue={props.dailyCarbGoal}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="dailyFatGoal" className={labelClass}>
                    Fat <span className="text-pink-500">g</span>
                  </label>
                  <input
                    id="dailyFatGoal" name="dailyFatGoal" type="number" required
                    defaultValue={props.dailyFatGoal}
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Save Panel ────────────────────────────────────── */}
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-slate-950 to-slate-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <p className="text-sm font-black text-white">Ready to save</p>
              </div>
              <p className="text-xs leading-5 text-slate-400">
                Your profile powers gym discovery, buddy matching, workout recommendations, and nutrition targets.
              </p>

              {/* Completion bar */}
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Profile completion</span>
                  <span className="text-emerald-400">{completion}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="p-5">
              <button
                type="submit"
                className="group flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-black text-white shadow-lg shadow-emerald-500/30 transition hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save className="h-4 w-4 transition group-hover:rotate-12" />
                Save Profile
              </button>

              {/* Powered by chips */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { icon: Users, label: "Buddy Matching", color: "text-violet-600 bg-violet-50" },
                  { icon: Dumbbell, label: "Workouts", color: "text-cyan-600 bg-cyan-50" },
                  { icon: MapPin, label: "Gym Discovery", color: "text-orange-600 bg-orange-50" },
                  { icon: Apple, label: "Nutrition", color: "text-emerald-600 bg-emerald-50" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 ${color}`}>
                    <Icon className="h-3 w-3 shrink-0" />
                    <span className="text-[10px] font-bold">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </form>

    </div>
  );
}
