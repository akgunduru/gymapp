import type { FitnessGoal, FitnessLevel, MuscleGroup } from "@prisma/client";

/* ─── Input / output types ───────────────────────────────── */
export type BuddyScoreInput = {
  myLevel: FitnessLevel;
  myGoals: FitnessGoal[];
  myMuscleGroups: MuscleGroup[];
  myCity: string | null;
  myDistrict: string | null;
  myLocation: Coordinates | null;
  myWeeklyDays: number;

  theirLevel: FitnessLevel;
  theirGoals: FitnessGoal[];
  theirMuscleGroups: MuscleGroup[];
  theirCity: string | null;
  theirDistrict: string | null;
  theirLocation: Coordinates | null;
  theirWeeklyDays: number;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type BuddyScoreResult = {
  score: number;   // 0–100
  reasons: string[];
  distanceKm: number | null;
};

/* ─── Human-readable labels ──────────────────────────────── */
const GOAL_LABELS: Record<FitnessGoal, string> = {
  LOSE_WEIGHT: "Lose weight",
  BUILD_MUSCLE: "Build muscle",
  STRENGTH:     "Strength",
  HEALTH:       "Health",
};

const GOAL_REASON_LABELS: Record<FitnessGoal, string> = {
  LOSE_WEIGHT: "Both focus on fat loss",
  BUILD_MUSCLE: "Both focus on muscle gain",
  STRENGTH: "Both focus on strength",
  HEALTH: "Both focus on health",
};

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  CHEST:     "Chest",
  BACK:      "Back",
  LEGS:      "Legs",
  SHOULDERS: "Shoulders",
  ARMS:      "Arms",
  CORE:      "Core",
  CARDIO:    "Cardio",
  FULL_BODY: "Full body",
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(from: Coordinates | null, to: Coordinates | null) {
  if (!from || !to) {
    return null;
  }

  const radiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── Scoring algorithm ──────────────────────────────────── */
//
//  Same fitness level           → +20
//  Shared fitness goal(s)       → up to +20
//  Shared preferred muscle(s)   → up to +20
//  Same city                    → +10
//  Same district                → +10
//  Similar workout days (±1)    → +10
//  Distance proximity           → up to +10
//                                 ──────
//  Max possible                 → 100
//
export function calculateBuddyScore(input: BuddyScoreInput): BuddyScoreResult {
  const reasons: string[] = [];
  let score = 0;
  const distanceKm = calculateDistanceKm(input.myLocation, input.theirLocation);

  /* Same level ──────────────────────────────────────────── */
  if (input.myLevel === input.theirLevel) {
    score += 20;
    reasons.push("Same fitness level");
  }

  /* Shared goals ────────────────────────────────────────── */
  const sharedGoals = input.myGoals.filter((g) => input.theirGoals.includes(g));
  if (sharedGoals.length > 0) {
    score += Math.min(20, sharedGoals.length * 10);
    reasons.push(GOAL_REASON_LABELS[sharedGoals[0]] ?? `Shared goal: ${GOAL_LABELS[sharedGoals[0]]}`);
  }

  /* Shared muscle groups ─────────────────────────────────── */
  const sharedMuscles = input.myMuscleGroups.filter((m) =>
    input.theirMuscleGroups.includes(m),
  );
  if (sharedMuscles.length > 0) {
    score += Math.min(20, sharedMuscles.length * 10);
    const primaryMuscle = MUSCLE_LABELS[sharedMuscles[0]].toLowerCase();
    reasons.push(`Both prefer ${primaryMuscle} workouts`);
  }

  /* Same city ─────────────────────────────────────────────── */
  if (
    input.myCity &&
    input.theirCity &&
    input.myCity.toLowerCase() === input.theirCity.toLowerCase()
  ) {
    score += 10;
    reasons.push(`Same city: ${input.myCity}`);
  }

  /* Same district ────────────────────────────────────────── */
  if (
    input.myDistrict &&
    input.theirDistrict &&
    input.myDistrict.toLowerCase() === input.theirDistrict.toLowerCase()
  ) {
    score += 10;
    reasons.push(`Same district: ${input.myDistrict}`);
  }

  /* Similar workout frequency ─────────────────────────────── */
  if (Math.abs(input.myWeeklyDays - input.theirWeeklyDays) <= 1) {
    score += 10;
    reasons.push("Similar workout frequency");
  }

  /* Distance proximity ───────────────────────────────────── */
  if (distanceKm !== null) {
    if (distanceKm <= 3) {
      score += 10;
    } else if (distanceKm <= 8) {
      score += 7;
    } else if (distanceKm <= 15) {
      score += 4;
    }

    reasons.push(`${distanceKm.toFixed(1)} km apart`);
  }

  return {
    score: Math.min(100, score),
    reasons,
    distanceKm,
  };
}
