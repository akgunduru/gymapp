import { z } from "zod";
import { FITNESS_GOALS, FITNESS_LEVELS, MUSCLE_GROUPS, USER_ROLES } from "@/lib/constants";

export const emailSchema = z.string().trim().email();

export const passwordSchema = z.string().min(8);

export const roleSchema = z.enum(USER_ROLES);

export const publicRegistrationRoleSchema = z.enum(["USER", "TRAINER", "DIETITIAN"]);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: emailSchema,
  password: passwordSchema,
  role: publicRegistrationRoleSchema,
});

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : null));

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  bio: optionalTextSchema,
  city: z.string().trim().min(2, "City is required."),
  district: z.string().trim().min(2, "District is required."),
  address: optionalTextSchema,
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  goals: z.array(z.enum(FITNESS_GOALS)).min(1, "Select at least one goal."),
  level: z.enum(FITNESS_LEVELS),
  preferredMuscleGroups: z
    .array(z.enum(MUSCLE_GROUPS))
    .min(1, "Select at least one muscle group."),
  weeklyWorkoutDays: z.coerce.number().int().min(1).max(7),
  dailyCalorieGoal: z.coerce.number().int().min(800).max(6000),
  dailyProteinGoal: z.coerce.number().int().min(0).max(400),
  dailyCarbGoal: z.coerce.number().int().min(0).max(800),
  dailyFatGoal: z.coerce.number().int().min(0).max(300),
});
