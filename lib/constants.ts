export const APP_NAME = "Social Gym System";

export const SESSION_COOKIE_NAME = "social_gym_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const USER_ROLES = ["USER", "TRAINER", "DIETITIAN", "ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const FITNESS_GOALS = ["LOSE_WEIGHT", "BUILD_MUSCLE", "STRENGTH", "HEALTH"] as const;

export const FITNESS_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export const MUSCLE_GROUPS = [
  "CHEST",
  "BACK",
  "LEGS",
  "SHOULDERS",
  "ARMS",
  "CORE",
  "CARDIO",
  "FULL_BODY",
] as const;

export type FitnessGoalValue = (typeof FITNESS_GOALS)[number];

export type FitnessLevelValue = (typeof FITNESS_LEVELS)[number];

export type MuscleGroupValue = (typeof MUSCLE_GROUPS)[number];

export const FITNESS_GOAL_LABELS: Record<FitnessGoalValue, string> = {
  LOSE_WEIGHT: "Lose weight",
  BUILD_MUSCLE: "Build muscle",
  STRENGTH: "Strength",
  HEALTH: "Health",
};

export const FITNESS_LEVEL_LABELS: Record<FitnessLevelValue, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const MUSCLE_GROUP_LABELS: Record<MuscleGroupValue, string> = {
  CHEST: "Chest",
  BACK: "Back",
  LEGS: "Legs",
  SHOULDERS: "Shoulders",
  ARMS: "Arms",
  CORE: "Core",
  CARDIO: "Cardio",
  FULL_BODY: "Full body",
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/gyms", label: "Gyms" },
  { href: "/matches", label: "Buddy matches" },
  { href: "/workouts", label: "Workouts" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/professionals", label: "Professionals" },
  { href: "/messages", label: "Messages" },
  { href: "/admin", label: "Admin" },
] as const;
