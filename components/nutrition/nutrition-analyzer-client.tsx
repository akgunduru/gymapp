"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Flame,
  Gauge,
  Leaf,
  Loader2,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import {
  analyzeMealText,
  type MealAnalysisResult,
  type NutritionGoal,
} from "@/lib/nutrition-parser";
import {
  deleteMealEntryAction,
  saveAnalyzedMealAction,
} from "@/lib/nutrition-actions";
import { AiDietGenerator } from "@/components/nutrition/ai-diet-generator";

export type NutritionHistoryMeal = {
  id: string;
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

export type NutritionHistoryLog = {
  id: string;
  logDate: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: NutritionHistoryMeal[];
};

type NutritionAnalyzerClientProps = {
  initialGoal: NutritionGoal;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  history: NutritionHistoryLog[];
};

const GOAL_OPTIONS: Array<{ value: NutritionGoal; label: string; description: string }> = [
  {
    value: "fat_loss",
    label: "Fat loss",
    description: "Lean protein, lower calories, high satiety.",
  },
  {
    value: "muscle_gain",
    label: "Muscle gain",
    description: "Protein anchor plus training-friendly carbs.",
  },
  {
    value: "healthy_lifestyle",
    label: "Healthy lifestyle",
    description: "Whole foods, fiber, and balanced macros.",
  },
];

const MEAL_TYPES = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "SNACK", label: "Snack" },
];

const MEAL_TYPE_COLORS: Record<string, string> = {
  BREAKFAST: "bg-amber-100 text-amber-700",
  LUNCH: "bg-emerald-100 text-emerald-700",
  DINNER: "bg-violet-100 text-violet-700",
  SNACK: "bg-cyan-100 text-cyan-700",
};

const DEMO_EXAMPLES = [
  "2 eggs, 1 slice whole wheat bread, tomato, yogurt",
  "100g chicken breast, rice, salad, 1 spoon olive oil",
  "banana and protein shake",
  "200g pasta with cheese",
  "oats and milk with berries",
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Utilities ─────────────────────────────────────────────────────────────────

function scoreGradient(score: number) {
  if (score >= 80) return "from-emerald-500 to-cyan-500";
  if (score >= 60) return "from-sky-500 to-blue-500";
  if (score >= 40) return "from-orange-500 to-pink-500";
  return "from-rose-500 to-red-600";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs balance";
  return "Improve meal";
}

function formatMacro(value: number) {
  return `${Math.round(value * 10) / 10}g`;
}

function formatDateLabel(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (year && month && day) {
    return `${MONTH_LABELS[month - 1] ?? "Date"} ${day}`;
  }
  const date = new Date(iso);
  return `${MONTH_LABELS[date.getMonth()] ?? "Date"} ${date.getDate()}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function todayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMealType(value: string) {
  const match = MEAL_TYPES.find((meal) => meal.value === value);
  return match?.label ?? value;
}

function targetProgress(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

function metricCards(result: MealAnalysisResult) {
  return [
    {
      label: "Calories",
      value: String(result.calories),
      sub: "kcal",
      icon: Flame,
      color: "from-orange-500 to-pink-500",
    },
    {
      label: "Protein",
      value: formatMacro(result.protein),
      sub: "muscle support",
      icon: Activity,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Carbs",
      value: formatMacro(result.carbs),
      sub: "training fuel",
      icon: Zap,
      color: "from-cyan-500 to-blue-500",
    },
    {
      label: "Fat",
      value: formatMacro(result.fat),
      sub: "energy density",
      icon: Leaf,
      color: "from-violet-500 to-fuchsia-500",
    },
  ];
}

// ── 7-day data builder ─────────────────────────────────────────────────────────

type DayData = {
  date: string;
  label: string;
  isToday: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

function getLast7DaysData(history: NutritionHistoryLog[]): DayData[] {
  const logMap = new Map(history.map((l) => [l.logDate, l]));
  const today = todayKey();
  const days: DayData[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const log = logMap.get(key);
    days.push({
      date: key,
      label: i === 0 ? "Today" : DAY_LABELS[d.getDay()] ?? "",
      isToday: key === today,
      calories: log?.totalCalories ?? 0,
      protein: log?.totalProtein ?? 0,
      carbs: log?.totalCarbs ?? 0,
      fat: log?.totalFat ?? 0,
    });
  }
  return days;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TodaySummary({
  today,
  targets,
}: {
  today: NutritionHistoryLog | undefined;
  targets: NutritionAnalyzerClientProps["targets"];
}) {
  const totals = today ?? {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  };
  const rows = [
    {
      label: "Calories",
      current: totals.totalCalories,
      target: targets.calories,
      unit: "kcal",
      color: "from-orange-500 to-pink-500",
    },
    {
      label: "Protein",
      current: totals.totalProtein,
      target: targets.protein,
      unit: "g",
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Carbs",
      current: totals.totalCarbs,
      target: targets.carbs,
      unit: "g",
      color: "from-cyan-500 to-blue-500",
    },
    {
      label: "Fat",
      current: totals.totalFat,
      target: targets.fat,
      unit: "g",
      color: "from-violet-500 to-fuchsia-500",
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-600">
            Today
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950">Nutrition progress</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <BarChart3 className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const progress = targetProgress(row.current, row.target);
          return (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-700">{row.label}</span>
                <span className="font-semibold text-slate-500">
                  {Math.round(row.current)}
                  {row.unit} / {row.target}
                  {row.unit}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${row.color} transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Stats Section ─────────────────────────────────────────────────────────────

function CssBarChart({
  data,
  valueKey,
  color,
  targetLine,
  unit,
}: {
  data: DayData[];
  valueKey: "calories" | "protein";
  color: string;
  targetLine?: number;
  unit: string;
}) {
  const values = data.map((d) => d[valueKey]);
  const maxVal = Math.max(...values, targetLine ?? 0, 1);

  return (
    <div className="space-y-2">
      <div className="relative flex items-end gap-1" style={{ height: 80 }}>
        {/* target line */}
        {targetLine ? (
          <div
            className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-slate-300"
            style={{ bottom: `${(targetLine / maxVal) * 80}px` }}
          />
        ) : null}
        {data.map((d) => {
          const h = Math.max(3, Math.round((d[valueKey] / maxVal) * 76));
          return (
            <div key={d.date} className="group relative flex flex-1 flex-col items-center">
              {/* tooltip */}
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                {Math.round(d[valueKey])}{unit}
              </div>
              <div
                className={`w-full rounded-t ${color} transition-all duration-500 ${d.isToday ? "opacity-100" : "opacity-60"}`}
                style={{ height: h }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1">
        {data.map((d) => (
          <div key={d.date} className={`flex-1 text-center text-[9px] font-bold ${d.isToday ? "text-slate-800" : "text-slate-400"}`}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function MacroDistribution({ today }: { today: NutritionHistoryLog | undefined }) {
  const p = today?.totalProtein ?? 0;
  const c = today?.totalCarbs ?? 0;
  const f = today?.totalFat ?? 0;
  const total = p + c + f;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-14 rounded-lg bg-slate-50 text-xs font-semibold text-slate-400">
        No macros logged today
      </div>
    );
  }

  const pPct = Math.round((p / total) * 100);
  const cPct = Math.round((c / total) * 100);
  const fPct = 100 - pPct - cPct;

  return (
    <div className="space-y-2">
      <div className="flex h-5 w-full overflow-hidden rounded-full">
        <div className="bg-emerald-500 transition-all" style={{ width: `${pPct}%` }} title={`Protein ${pPct}%`} />
        <div className="bg-cyan-500 transition-all" style={{ width: `${cPct}%` }} title={`Carbs ${cPct}%`} />
        <div className="bg-violet-500 transition-all" style={{ width: `${fPct}%` }} title={`Fat ${fPct}%`} />
      </div>
      <div className="flex gap-3 text-[11px] font-bold">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Protein {pPct}%</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-cyan-500" />Carbs {cPct}%</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-violet-500" />Fat {fPct}%</span>
      </div>
    </div>
  );
}

function StatsSection({
  history,
  targets,
}: {
  history: NutritionHistoryLog[];
  targets: NutritionAnalyzerClientProps["targets"];
}) {
  const days = getLast7DaysData(history);
  const today = history.find((l) => l.logDate === todayKey());

  const activeDays = days.filter((d) => d.calories > 0);
  const avgCalories = activeDays.length
    ? Math.round(activeDays.reduce((s, d) => s + d.calories, 0) / activeDays.length)
    : 0;

  const bestProteinDay = days.reduce<DayData | null>(
    (best, d) => (d.protein > (best?.protein ?? 0) ? d : best),
    null,
  );

  const goalDays = days.filter((d) => d.calories >= targets.calories * 0.8).length;
  const goalPct = days.length ? Math.round((goalDays / days.length) * 100) : 0;

  const totalMeals = history.reduce((s, l) => s + l.meals.length, 0);

  const summaryCards = [
    {
      label: "7-day avg calories",
      value: avgCalories ? `${avgCalories} kcal` : "—",
      icon: Flame,
      color: "bg-orange-50 text-orange-600",
      border: "border-orange-100",
    },
    {
      label: "Best protein day",
      value: bestProteinDay && bestProteinDay.protein > 0
        ? `${Math.round(bestProteinDay.protein)}g — ${bestProteinDay.label}`
        : "—",
      icon: Star,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
    },
    {
      label: "Goal completion",
      value: `${goalPct}%`,
      icon: Target,
      color: "bg-violet-50 text-violet-600",
      border: "border-violet-100",
    },
    {
      label: "Meals logged (7d)",
      value: String(totalMeals),
      icon: Utensils,
      color: "bg-cyan-50 text-cyan-600",
      border: "border-cyan-100",
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-violet-600" />
        <h2 className="text-lg font-extrabold text-slate-950">7-Day Statistics</h2>
      </div>

      {/* Summary stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`rounded-lg border ${border} bg-white p-4 shadow-sm`}>
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-md ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-extrabold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-orange-600">Calories</p>
              <p className="mt-0.5 text-sm font-bold text-slate-700">7-day trend</p>
            </div>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <CssBarChart
            data={days}
            valueKey="calories"
            color="bg-gradient-to-t from-orange-500 to-pink-400"
            targetLine={targets.calories}
            unit=" kcal"
          />
          <p className="mt-2 text-[10px] font-semibold text-slate-400">
            Dashed line = daily goal ({targets.calories} kcal)
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-600">Protein</p>
              <p className="mt-0.5 text-sm font-bold text-slate-700">7-day trend</p>
            </div>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <CssBarChart
            data={days}
            valueKey="protein"
            color="bg-gradient-to-t from-emerald-500 to-teal-400"
            targetLine={targets.protein}
            unit="g"
          />
          <p className="mt-2 text-[10px] font-semibold text-slate-400">
            Dashed line = protein goal ({targets.protein}g)
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-violet-600">Macros</p>
              <p className="mt-0.5 text-sm font-bold text-slate-700">Today's distribution</p>
            </div>
            <BarChart3 className="h-4 w-4 text-violet-500" />
          </div>
          <MacroDistribution today={today} />

          {today ? (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Protein", value: formatMacro(today.totalProtein), color: "text-emerald-600" },
                { label: "Carbs", value: formatMacro(today.totalCarbs), color: "text-cyan-600" },
                { label: "Fat", value: formatMacro(today.totalFat), color: "text-violet-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-md bg-slate-50 p-2">
                  <p className={`text-sm font-extrabold ${color}`}>{value}</p>
                  <p className="text-[10px] font-bold text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ── Analysis Results ──────────────────────────────────────────────────────────

function AnalysisResults({
  result,
  mealType,
  isSaving,
  saveStatus,
  isSaved,
  onSave,
}: {
  result: MealAnalysisResult;
  mealType: string;
  isSaving: boolean;
  saveStatus: string | null;
  isSaved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards(result).map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br ${color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-950">{value}</p>
            <p className="text-xs font-semibold text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-violet-600 text-white">
            <Brain className="h-5 w-5" />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-violet-700">
            Meal type
          </p>
          <p className="mt-1 text-lg font-extrabold text-slate-950">
            {result.mlPrediction.mealCategoryLabel}
          </p>
          <p className="mt-1 text-xs font-semibold text-violet-700">
            Based on your macro composition
          </p>
        </div>

        <div className="rounded-lg border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600 text-white">
            <Target className="h-5 w-5" />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-700">
            Goal fit
          </p>
          <p className="mt-1 text-lg font-extrabold text-slate-950">
            {result.mlPrediction.goalCompatibility.label}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              style={{ width: `${result.mlPrediction.goalCompatibility.score}%` }}
            />
          </div>
          <p className="mt-1 text-xs font-semibold text-emerald-700">
            {result.mlPrediction.goalCompatibility.score}/100 compatibility
          </p>
        </div>

        <div className="rounded-lg border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-sky-600 text-white">
            <Gauge className="h-5 w-5" />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-sky-700">
            Protein quality
          </p>
          <p className="mt-1 text-lg font-extrabold text-slate-950">
            {result.protein >= 30 ? "High protein" : result.protein >= 15 ? "Moderate protein" : "Low protein"}
          </p>
          <p className="mt-1 text-xs font-semibold text-sky-700">
            {result.protein >= 30
              ? "Excellent for muscle recovery"
              : result.protein >= 15
              ? "Consider adding a protein source"
              : "Add lean protein to this meal"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[340px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                Meal score
              </p>
              <p className="mt-1 text-sm font-bold text-slate-600">{scoreLabel(result.healthScore)}</p>
            </div>
            <div className={`flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br ${scoreGradient(result.healthScore)} text-2xl font-extrabold text-white shadow-sm`}>
              {result.healthScore}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
              ✓ Analysis complete
            </span>
            {result.flags.map((flag) => (
              <span key={flag} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-extrabold text-cyan-700">
                {flag}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || isSaved || result.calories === 0}
            className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-extrabold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaved ? "Saved to history" : `Save as ${formatMealType(mealType)}`}
          </button>

          {saveStatus ? (
            <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
              {saveStatus}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 2xl:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-violet-600" />
              <h3 className="font-extrabold text-slate-950">Detected foods</h3>
            </div>
            {result.detectedFoods.length === 0 ? (
              <p className="text-sm text-slate-500">No matching foods detected yet.</p>
            ) : (
              <div className="space-y-3">
                {result.detectedFoods.map((food) => (
                  <div key={`${food.id}-${food.matchedText}`} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-slate-800">{food.name}</p>
                        <p className="text-xs font-semibold text-slate-500">
                          {food.servingDescription} - matched &quot;{food.matchedText}&quot;
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-extrabold text-emerald-700">
                        {food.confidence}%
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                      <span>{food.calories} kcal</span>
                      <span>{formatMacro(food.protein)} protein</span>
                      <span>{formatMacro(food.carbs)} carbs</span>
                      <span>{formatMacro(food.fat)} fat</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {result.unknownFoods.length > 0 ? (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                Unknown: {result.unknownFoods.join(", ")}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <h3 className="font-extrabold text-slate-950">Smart Nutrition Insights</h3>
              </div>
              <div className="space-y-2">
                {result.advice.map((item) => (
                  <div key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-emerald-700" />
                <h3 className="font-extrabold text-emerald-950">Better alternative</h3>
              </div>
              <p className="text-sm leading-6 text-emerald-800">{result.betterAlternative}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── History Panel ─────────────────────────────────────────────────────────────

function HistoryPanel({
  history,
  deletingIds,
  onDelete,
}: {
  history: NutritionHistoryLog[];
  deletingIds: Set<string>;
  onDelete: (mealId: string) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-cyan-600">
            Saved meals
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950">Nutrition history</h2>
        </div>
        <Utensils className="h-5 w-5 text-cyan-600" />
      </div>

      {history.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <Utensils className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-bold text-slate-500">No meals logged yet.</p>
          <p className="mt-1 text-xs text-slate-400">Analyze and save a meal to start tracking.</p>
        </div>
      ) : (
        <div className="max-h-[560px] space-y-4 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {history.map((log) => (
            <div key={log.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              {/* Day header */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800">{formatDateLabel(log.logDate)}</span>
                  {log.logDate === todayKey() && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                      TODAY
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {Math.round(log.totalCalories)} kcal
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-emerald-500" />
                    {formatMacro(log.totalProtein)} P
                  </span>
                </div>
              </div>

              {/* Macro progress bar */}
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                {log.totalCalories > 0 && (
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${Math.min(100, (log.totalCalories / 2200) * 100)}%` }}
                  />
                )}
              </div>

              {/* Meal entries */}
              {log.meals.length === 0 ? (
                <p className="text-xs text-slate-400">No individual meals recorded.</p>
              ) : (
                <div className="space-y-2">
                  {log.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center gap-3 rounded-md border border-slate-100 bg-white px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-700 truncate max-w-[180px]" title={meal.name}>
                            {meal.name}
                          </p>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${MEAL_TYPE_COLORS[meal.mealType] ?? "bg-slate-100 text-slate-600"}`}>
                            {formatMealType(meal.mealType)}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                          <span>{meal.calories} kcal</span>
                          <span className="text-emerald-600">{formatMacro(meal.protein)} P</span>
                          <span className="text-cyan-600">{formatMacro(meal.carbs)} C</span>
                          <span className="text-violet-600">{formatMacro(meal.fat)} F</span>
                          {meal.createdAt && (
                            <span className="text-slate-400">{formatTime(meal.createdAt)}</span>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => onDelete(meal.id)}
                        disabled={deletingIds.has(meal.id)}
                        aria-label={`Delete ${meal.name}`}
                        className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-slate-300 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-wait disabled:opacity-50"
                      >
                        {deletingIds.has(meal.id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function NutritionAnalyzerClient({
  initialGoal,
  targets,
  history,
}: NutritionAnalyzerClientProps) {
  const router = useRouter();
  const [mealText, setMealText] = useState(DEMO_EXAMPLES[0]);
  const [goal, setGoal] = useState<NutritionGoal>(initialGoal);
  const [mealType, setMealType] = useState("LUNCH");
  const [analysis, setAnalysis] = useState<MealAnalysisResult | null>(() =>
    analyzeMealText(DEMO_EXAMPLES[0], initialGoal),
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [isDietGenOpen, setIsDietGenOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const today = history.find((log) => log.logDate === todayKey());
  const currentResultKey = analysis
    ? `${analysis.input}-${analysis.calories}-${analysis.protein}-${analysis.carbs}-${analysis.fat}`
    : "";
  const isSaved = Boolean(currentResultKey && savedKey === currentResultKey);

  const selectedGoal = useMemo(
    () => GOAL_OPTIONS.find((option) => option.value === goal) ?? GOAL_OPTIONS[0],
    [goal],
  );

  /** Summary numbers shown in the compact stats badge. */
  const statsSummary = useMemo(() => {
    const days = getLast7DaysData(history);
    const activeDays = days.filter((d) => d.calories > 0);
    const avgCalories = activeDays.length
      ? Math.round(activeDays.reduce((s, d) => s + d.calories, 0) / activeDays.length)
      : 0;
    const goalDays = days.filter((d) => d.calories >= targets.calories * 0.8).length;
    const goalPct = days.length ? Math.round((goalDays / days.length) * 100) : 0;
    const totalMeals = history.reduce((s, l) => s + l.meals.length, 0);
    return { avgCalories, goalPct, totalMeals };
  }, [history, targets.calories]);

  function handleAnalyze(nextText = mealText) {
    setIsAnalyzing(true);
    setSaveStatus(null);
    window.setTimeout(() => {
      setAnalysis(analyzeMealText(nextText, goal));
      setIsAnalyzing(false);
      setSavedKey(null);
    }, 420);
  }

  function handleExample(example: string) {
    setMealText(example);
    handleAnalyze(example);
  }

  function handleSave() {
    if (!analysis || analysis.calories === 0) return;
    setSaveStatus(null);

    startSaving(async () => {
      const result = await saveAnalyzedMealAction({
        description: analysis.input,
        mealType,
        calories: analysis.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
      });

      if (result.success) {
        setSavedKey(currentResultKey);
        setSaveStatus("Meal saved to your nutrition history!");
        router.refresh();
      } else {
        setSaveStatus(result.error ?? "Meal could not be saved.");
      }
    });
  }

  async function handleDeleteMeal(mealId: string) {
    setDeleteError(null);
    setDeletingIds((prev) => new Set([...prev, mealId]));

    const result = await deleteMealEntryAction(mealId);

    if (result.success) {
      router.refresh();
    } else {
      setDeleteError(result.error ?? "Could not delete meal.");
    }

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(mealId);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg bg-slate-950 text-white shadow-lg">
        <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-cyan-950 px-5 py-7 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Smart Nutrition Analysis
              </div>
              <h1 className="text-3xl font-extrabold tracking-normal sm:text-4xl">
                AI Meal Analyzer
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Describe what you ate in plain text and get instant macro breakdowns,
                goal compatibility scores, and personalized nutrition coaching.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-xs font-bold text-slate-300">Selected goal</p>
              <p className="mt-1 text-xl font-extrabold">{selectedGoal.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">{selectedGoal.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Diet Generator Banner ── */}
      <section className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Create a Personalized Diet Plan with AI</h3>
            <p className="text-xs text-slate-400 mt-1">Get a custom, portion-scaled nutrition program based on your physical profile and fitness goals.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsDietGenOpen(true)}
          className="relative z-10 shrink-0 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition hover:scale-[1.02] active:scale-[0.98]"
        >
          Create Diet Plan
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {isDietGenOpen && (
        <AiDietGenerator
          initialGoal={goal}
          onClose={() => setIsDietGenOpen(false)}
        />
      )}

      {/* ── Stats compact toggle + animated drawer ── */}
      <section>
        {/* Clickable compact badge */}
        <button
          type="button"
          onClick={() => setIsStatsOpen((o) => !o)}
          aria-expanded={isStatsOpen}
          className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm transition-all hover:border-violet-200 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
              <TrendingUp className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-extrabold uppercase tracking-wide text-violet-600">
                7-Day Nutrition Stats
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1 text-xs font-bold text-slate-600">
                  <Utensils className="h-3 w-3 text-cyan-500" />
                  <span className="text-slate-900">{statsSummary.totalMeals}</span>
                  {" "}meals logged
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-600">
                  <Flame className="h-3 w-3 text-orange-500" />
                  avg{" "}
                  <span className="text-slate-900">
                    {statsSummary.avgCalories || "—"}
                  </span>{" "}
                  kcal/day
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-600">
                  <Target className="h-3 w-3 text-emerald-500" />
                  goal:{" "}
                  <span
                    className={
                      statsSummary.goalPct >= 70
                        ? "text-emerald-600"
                        : "text-orange-600"
                    }
                  >
                    {statsSummary.goalPct}%
                  </span>
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden text-xs font-bold text-slate-400 sm:block">
                {isStatsOpen ? "Hide stats" : "View details"}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                  isStatsOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </button>

        {/*
          CSS grid-rows animation — expands from 0fr to 1fr without
          needing a known pixel height. Works in all modern browsers.
        */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: isStatsOpen ? "1fr" : "0fr",
            transition: "grid-template-rows 0.35s ease",
          }}
        >
          <div className="overflow-hidden">
            <div className="pt-4">
              <StatsSection history={history} targets={targets} />
            </div>
          </div>
        </div>
      </section>

      {/* Delete error banner */}
      {deleteError ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-bold text-red-700">{deleteError}</p>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-violet-600">
                  Smart meal analysis
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                  Analyze a meal description
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Instant &amp; private
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <label htmlFor="mealText" className="text-sm font-bold text-slate-700">
                  Meal text
                </label>
                <textarea
                  id="mealText"
                  value={mealText}
                  onChange={(event) => setMealText(event.target.value)}
                  className="min-h-32 w-full resize-none rounded-md border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Example: 2 eggs, 1 slice bread, 100g chicken breast"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="goal" className="text-sm font-bold text-slate-700">
                    Goal
                  </label>
                  <select
                    id="goal"
                    value={goal}
                    onChange={(event) => setGoal(event.target.value as NutritionGoal)}
                    className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {GOAL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="mealType" className="text-sm font-bold text-slate-700">
                    Save as
                  </label>
                  <select
                    id="mealType"
                    value={mealType}
                    onChange={(event) => setMealType(event.target.value)}
                    className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {MEAL_TYPES.map((meal) => (
                      <option key={meal.value} value={meal.value}>
                        {meal.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-600 text-sm font-extrabold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isAnalyzing ? "Analyzing" : "Analyze meal"}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {DEMO_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExample(example)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {example}
                </button>
              ))}
            </div>
          </section>

          {analysis ? (
            <AnalysisResults
              result={analysis}
              mealType={mealType}
              isSaving={isSaving}
              saveStatus={saveStatus}
              isSaved={isSaved}
              onSave={handleSave}
            />
          ) : null}
        </div>

        <div className="space-y-6">
          <TodaySummary today={today} targets={targets} />
          <HistoryPanel
            history={history}
            deletingIds={deletingIds}
            onDelete={handleDeleteMeal}
          />
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
        Nutrition estimates are approximate and intended for general guidance only.
      </div>
    </div>
  );
}
