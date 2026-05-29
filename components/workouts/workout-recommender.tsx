"use client";

import { useMemo, useState, Fragment } from "react";
import type { LucideIcon } from "lucide-react";
import { AiCoachPanel } from "@/components/workouts/ai-coach-panel";
import {
  Activity,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Clock3,
  Dumbbell,
  ExternalLink,
  Flame,
  Gauge,
  ListChecks,
  RefreshCcw,
  Sparkles,
  Target,
  Trophy,
  Video,
  X,
} from "lucide-react";
import type {
  WorkoutFilterOptions,
  WorkoutProgram,
} from "@/components/workouts/types";
import {
  getExercisesForProgram,
  youtubeSearchUrl,
  type ExerciseItem,
} from "@/lib/exercise-library";

type WorkoutRecommenderProps = {
  programs: WorkoutProgram[];
  options: WorkoutFilterOptions;
};

type Filters = {
  level: string;
  goal: string;
  equipment: string;
  duration: number;
};

type Recommendation = WorkoutProgram & {
  score: number;
  reasons: string[];
  durationGap: number | null;
};

const LEVEL_NEIGHBORS: Record<string, string[]> = {
  Beginner: ["Intermediate"],
  Intermediate: ["Beginner", "Advanced"],
  Advanced: ["Intermediate"],
};

const EQUIPMENT_COMPATIBILITY: Record<string, string[]> = {
  "At Home": ["Bodyweight", "Dumbbells"],
  Bodyweight: ["At Home"],
  Dumbbells: ["At Home", "Full Gym"],
  "Full Gym": ["Dumbbells"],
};

const DEFAULTS: Filters = {
  level: "Intermediate",
  goal: "Muscle Gain",
  equipment: "Full Gym",
  duration: 60,
};

function getDefaultValue<T extends string | number>(values: T[], preferred: T) {
  return values.includes(preferred) ? preferred : values[0];
}

function scoreProgram(program: WorkoutProgram, filters: Filters): Recommendation {
  const reasons: string[] = [];
  let score = 0;

  if (program.level === filters.level) {
    score += 25;
    reasons.push(`Fits ${filters.level} level`);
  } else if (LEVEL_NEIGHBORS[filters.level]?.includes(program.level)) {
    score += 12;
    reasons.push(`Near your level: ${program.level}`);
  }

  if (program.goal === filters.goal) {
    score += 30;
    reasons.push(`Built for ${filters.goal}`);
  }

  if (program.equipment === filters.equipment) {
    score += 25;
    reasons.push(`Uses ${filters.equipment}`);
  } else if (EQUIPMENT_COMPATIBILITY[filters.equipment]?.includes(program.equipment)) {
    score += 14;
    reasons.push(`Compatible equipment: ${program.equipment}`);
  }

  const durationGap = Math.abs(program.duration - filters.duration);

  if (durationGap === 0) {
    score += 20;
    reasons.push(`${filters.duration} min sessions`);
  } else if (durationGap <= 10) {
    score += 17;
    reasons.push(`Within ${durationGap} min of your target`);
  } else if (durationGap <= 20) {
    score += 11;
    reasons.push(`Close duration fit`);
  } else if (durationGap <= 30) {
    score += 6;
    reasons.push(`Manageable duration gap`);
  }

  return { ...program, score, reasons, durationGap };
}

function formatWeeks(value: number) {
  return `${Math.round(value)} weeks`;
}

function formatMinutes(value: number) {
  return `${Math.round(value)} min`;
}

function formatExercises(value: number) {
  return `${Math.round(value)} exercises`;
}

function SelectField({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <Icon className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ── Exercise video row ───────────────────────────────────── */
function ExerciseRow({
  exercise,
  index,
  programId,
  activeVideoKey,
  onToggleVideo,
}: {
  exercise: ExerciseItem;
  index: number;
  programId: string;
  activeVideoKey: string | null;
  onToggleVideo: (key: string) => void;
}) {
  const videoKey = `${programId}-${index}`;
  const isVideoOpen = activeVideoKey === videoKey;
  const hasEmbed = exercise.youtubeId !== null;
  const searchUrl = youtubeSearchUrl(exercise.name);

  function handleVideoClick() {
    if (hasEmbed) {
      onToggleVideo(videoKey);
    } else {
      window.open(searchUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Fragment>
      {/* Exercise row */}
      <tr className="group hover:bg-slate-50/80 transition-colors">
        {/* # */}
        <td className="w-8 px-3 py-3 text-center text-xs font-bold text-slate-400">
          {index + 1}
        </td>

        {/* Name */}
        <td className="px-3 py-3 text-sm font-black text-slate-800 leading-snug">
          {exercise.name}
        </td>

        {/* Sets × Reps */}
        <td className="px-3 py-3 text-center text-xs font-extrabold text-emerald-700 whitespace-nowrap">
          {exercise.sets} × {exercise.reps}
        </td>

        {/* Equipment */}
        <td className="hidden sm:table-cell px-3 py-3 text-xs text-slate-500 font-semibold">
          {exercise.equipment}
        </td>

        {/* Tip */}
        <td className="hidden md:table-cell px-3 py-3 text-xs text-slate-400 leading-relaxed max-w-xs">
          {exercise.tip}
        </td>

        {/* Video button */}
        <td className="px-3 py-3 text-center">
          <button
            type="button"
            onClick={handleVideoClick}
            title={hasEmbed ? (isVideoOpen ? "Close video" : "Watch tutorial") : "Search on YouTube"}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-sm border ${
              isVideoOpen
                ? "bg-red-700 border-red-700 text-white hover:bg-red-800"
                : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            }`}
          >
            {hasEmbed ? (
              <>
                <Video className="h-3 w-3 fill-current" aria-hidden="true" />
                {isVideoOpen ? "Close" : "Watch"}
              </>
            ) : (
              <>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                Search
              </>
            )}
          </button>
        </td>
      </tr>

      {/* Mobile tip row (md and below) */}
      <tr className="md:hidden bg-slate-50/50">
        <td colSpan={6} className="px-3 pb-2 pt-0 text-xs text-slate-400 italic leading-relaxed">
          <span className="font-semibold text-slate-500 not-italic">Tip: </span>
          {exercise.tip}
          <span className="ml-2 not-italic text-slate-400 font-semibold">
            ({exercise.equipment})
          </span>
        </td>
      </tr>

      {/* Inline YouTube embed */}
      {isVideoOpen && hasEmbed && (
        <tr className="bg-slate-950 print:hidden">
          <td colSpan={6} className="p-4">
            <div className="max-w-2xl mx-auto space-y-2">
              {/* Embed header */}
              <div className="flex items-center justify-between text-white pb-1.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-xs font-black tracking-wider uppercase text-slate-200">
                    {exercise.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${exercise.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] font-black text-red-400 border border-slate-700 transition"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    Open in YouTube
                  </a>
                  <button
                    type="button"
                    onClick={() => onToggleVideo(videoKey)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    aria-label="Close video"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* iframe */}
              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl border border-slate-800">
                <iframe
                  src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  title={`${exercise.name} tutorial`}
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}

/* ── Exercises panel per program card ───────────────────────*/
function ExercisesPanel({
  program,
  activeVideoKey,
  onToggleVideo,
}: {
  program: Recommendation;
  activeVideoKey: string | null;
  onToggleVideo: (key: string) => void;
}) {
  const exercises = useMemo(
    () => getExercisesForProgram(program.goal, program.equipment, program.level),
    [program.goal, program.equipment, program.level]
  );

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
      {/* Table header */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-950 text-[9px] font-black uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-3 py-2.5 w-8 text-center">#</th>
              <th className="px-3 py-2.5">Exercise</th>
              <th className="px-3 py-2.5 text-center">Sets × Reps</th>
              <th className="hidden sm:table-cell px-3 py-2.5">Equipment</th>
              <th className="hidden md:table-cell px-3 py-2.5">Key Tip</th>
              <th className="px-3 py-2.5 text-center">Video</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {exercises.map((exercise, i) => (
              <ExerciseRow
                key={i}
                exercise={exercise}
                index={i}
                programId={program.id}
                activeVideoKey={activeVideoKey}
                onToggleVideo={onToggleVideo}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400 font-medium">
        Representative exercises · Sets adjusted for {program.level} level ·
        Click <span className="font-black text-red-600">Watch</span> to view an
        inline tutorial or{" "}
        <span className="font-black text-slate-500">Search</span> to find one on
        YouTube.
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export function WorkoutRecommender({
  programs,
  options,
}: WorkoutRecommenderProps) {
  const [filters, setFilters] = useState<Filters>({
    level: getDefaultValue(options.levels, DEFAULTS.level),
    goal: getDefaultValue(options.goals, DEFAULTS.goal),
    equipment: getDefaultValue(options.equipment, DEFAULTS.equipment),
    duration: getDefaultValue(options.durations, DEFAULTS.duration),
  });

  // Track which program cards have exercises expanded
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(
    new Set()
  );
  // Track which exercise's video is open — key: `${programId}-${exerciseIndex}`
  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null);

  const recommendations = useMemo(() => {
    return programs
      .map((program) => scoreProgram(program, filters))
      .filter((program) => program.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.durationGap ?? 999) - (b.durationGap ?? 999);
      })
      .slice(0, 8);
  }, [filters, programs]);

  const topScore = recommendations[0]?.score ?? 0;
  const exactMatches = recommendations.filter((p) => p.score >= 90).length;

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      level: getDefaultValue(options.levels, DEFAULTS.level),
      goal: getDefaultValue(options.goals, DEFAULTS.goal),
      equipment: getDefaultValue(options.equipment, DEFAULTS.equipment),
      duration: getDefaultValue(options.durations, DEFAULTS.duration),
    });
  }

  function toggleProgram(id: string) {
    setExpandedPrograms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // Close any video that belongs to this program
        setActiveVideoKey((vk) =>
          vk?.startsWith(id + "-") ? null : vk
        );
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleVideo(key: string) {
    setActiveVideoKey((prev) => (prev === key ? null : key));
  }

  return (
    <div className="space-y-5">
      {/* ── Hero banner ─────────────────────────────────── */}
      <section className="overflow-hidden rounded-lg border border-white/70 bg-[linear-gradient(135deg,#ecfdf5_0%,#eff6ff_48%,#fff7ed_100%)] shadow-xl shadow-emerald-900/10">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px] lg:p-7">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Smart workout finder
            </div>
            <h1 className="max-w-3xl text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
              Match your next training program to how you actually work out
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-2 self-end">
            <div className="rounded-lg bg-emerald-500 p-3 text-white shadow-lg shadow-emerald-500/20">
              <p className="text-2xl font-black">{programs.length}</p>
              <p className="text-xs font-bold text-emerald-50">programs</p>
            </div>
            <div className="rounded-lg bg-cyan-500 p-3 text-white shadow-lg shadow-cyan-500/20">
              <p className="text-2xl font-black">{topScore}</p>
              <p className="text-xs font-bold text-cyan-50">top score</p>
            </div>
            <div className="rounded-lg bg-pink-500 p-3 text-white shadow-lg shadow-pink-500/20">
              <p className="text-2xl font-black">{exactMatches}</p>
              <p className="text-xs font-bold text-pink-50">elite fits</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters + results ───────────────────────────── */}
      <section className="grid gap-5 xl:grid-cols-[330px_1fr]">
        {/* Sidebar filters */}
        <aside className="h-fit rounded-lg border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-900/5 xl:sticky xl:top-24">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-950">
                Recommendation filters
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Curated demo program matching
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              aria-label="Reset filters"
              title="Reset filters"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-4">
            <SelectField
              icon={Gauge}
              label="Fitness level"
              value={filters.level}
              options={options.levels.map((l) => ({ label: l, value: l }))}
              onChange={(v) => updateFilter("level", v)}
            />
            <SelectField
              icon={Target}
              label="Goal"
              value={filters.goal}
              options={options.goals.map((g) => ({ label: g, value: g }))}
              onChange={(v) => updateFilter("goal", v)}
            />
            <SelectField
              icon={Dumbbell}
              label="Equipment"
              value={filters.equipment}
              options={options.equipment.map((e) => ({ label: e, value: e }))}
              onChange={(v) => updateFilter("equipment", v)}
            />
            <SelectField
              icon={Clock3}
              label="Workout duration"
              value={String(filters.duration)}
              options={options.durations.map((d) => ({
                label: `${d} min`,
                value: String(d),
              }))}
              onChange={(v) => updateFilter("duration", Number(v))}
            />
          </div>

          <div className="mt-5 rounded-lg bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-200">
              <Flame className="h-4 w-4" aria-hidden="true" />
              Current match profile
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                filters.level,
                filters.goal,
                filters.equipment,
                `${filters.duration} min`,
              ].map((value) => (
                <span
                  key={value}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* Results list */}
        <div className="grid gap-4">
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-950">
                Top {recommendations.length} recommendations
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Ranked from {programs.length.toLocaleString()} curated programs
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Score uses level, goal, equipment, duration
            </div>
          </div>

          {recommendations.map((program, index) => {
            const isExpanded = expandedPrograms.has(program.id);

            return (
              <article
                key={program.id}
                className="rounded-lg border border-white/70 bg-white p-4 shadow-lg shadow-slate-900/6 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/10"
              >
                {/* Program summary (unchanged layout) */}
                <div className="grid gap-4 lg:grid-cols-[1fr_130px]">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-950 px-2 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                        <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatWeeks(program.programLength)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatMinutes(program.duration)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                        <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatExercises(program.totalExercises)}
                      </span>
                    </div>

                    <h2 className="text-xl font-black tracking-normal text-slate-950">
                      {program.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
                      {program.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {program.reasons.map((reason) => (
                        <span
                          key={reason}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                        >
                          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          {reason}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                      <span>{program.level}</span>
                      <span aria-hidden="true">/</span>
                      <span>{program.goal}</span>
                      <span aria-hidden="true">/</span>
                      <span>{program.equipment}</span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Recommended for: {program.recommendedFor}
                    </p>
                  </div>

                  {/* Score card */}
                  <div className="rounded-lg bg-[linear-gradient(145deg,#0f172a_0%,#064e3b_100%)] p-4 text-white">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-200">
                      <Activity className="h-4 w-4" aria-hidden="true" />
                      Match score
                    </div>
                    <p className="mt-2 text-4xl font-black">{program.score}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-orange-300"
                        style={{ width: `${program.score}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-slate-300">
                      {program.score >= 90
                        ? "Excellent fit"
                        : program.score >= 75
                          ? "Strong fit"
                          : program.score >= 55
                            ? "Useful fit"
                            : "Partial fit"}
                    </p>
                  </div>
                </div>

                {/* ── Exercises toggle ──────────────────── */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => toggleProgram(program.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    )}
                    <Video className="h-3.5 w-3.5" aria-hidden="true" />
                    {isExpanded
                      ? "Hide Exercises"
                      : "View Exercises & Tutorials"}
                  </button>

                  {isExpanded && (
                    <ExercisesPanel
                      program={program}
                      activeVideoKey={activeVideoKey}
                      onToggleVideo={toggleVideo}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── AI Fitness Coach ───────────────────────────── */}
      <AiCoachPanel filters={filters} />
    </div>
  );
}
