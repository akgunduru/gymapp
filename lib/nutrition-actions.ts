"use server";

import { revalidatePath } from "next/cache";
import { MealSource, MealType } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export type SaveAnalyzedMealInput = {
  description: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type SaveAnalyzedMealResult = {
  success: boolean;
  error?: string;
};

const ALLOWED_MEAL_TYPES = new Set<string>([
  MealType.BREAKFAST,
  MealType.LUNCH,
  MealType.DINNER,
  MealType.SNACK,
]);

function todayDateOnly() {
  const today = new Date();
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export async function saveAnalyzedMealAction(
  input: SaveAnalyzedMealInput,
): Promise<SaveAnalyzedMealResult> {
  const user = await requireUser();
  const description = input.description.trim();

  if (!description) {
    return { success: false, error: "Meal description is required." };
  }

  if (!ALLOWED_MEAL_TYPES.has(input.mealType)) {
    return { success: false, error: "Please choose a valid meal type." };
  }

  const calories = Math.round(clampNumber(input.calories, 0, 5000));
  const protein = clampNumber(input.protein, 0, 400);
  const carbs = clampNumber(input.carbs, 0, 700);
  const fat = clampNumber(input.fat, 0, 400);

  if (calories === 0) {
    return { success: false, error: "Analyze a recognized meal before saving." };
  }

  try {
    await db.$transaction(async (tx) => {
      const log = await tx.nutritionLog.upsert({
        where: {
          userId_logDate: {
            userId: user.id,
            logDate: todayDateOnly(),
          },
        },
        update: {
          totalCalories: { increment: calories },
          totalProtein: { increment: protein },
          totalCarbs: { increment: carbs },
          totalFat: { increment: fat },
        },
        create: {
          userId: user.id,
          logDate: todayDateOnly(),
          totalCalories: calories,
          totalProtein: protein,
          totalCarbs: carbs,
          totalFat: fat,
        },
      });

      await tx.mealEntry.create({
        data: {
          nutritionLogId: log.id,
          userId: user.id,
          mealType: input.mealType as MealType,
          source: MealSource.MANUAL,
          name: description.slice(0, 120),
          calories,
          protein,
          carbs,
          fat,
        },
      });
    });

    revalidatePath("/nutrition");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[nutrition-actions] saveAnalyzedMealAction:", error);
    return { success: false, error: "Meal could not be saved. Please try again." };
  }
}

// ── Delete a single meal entry ────────────────────────────────────────────────

export type DeleteMealResult = {
  success: boolean;
  error?: string;
};

export async function deleteMealEntryAction(
  mealEntryId: string,
): Promise<DeleteMealResult> {
  const user = await requireUser();

  if (!mealEntryId) {
    return { success: false, error: "Invalid meal ID." };
  }

  try {
    const entry = await db.mealEntry.findUnique({
      where: { id: mealEntryId },
      select: {
        userId: true,
        nutritionLogId: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
      },
    });

    if (!entry) {
      return { success: false, error: "Meal entry not found." };
    }

    // Guard: user can only delete their own meals
    if (entry.userId !== user.id) {
      return { success: false, error: "Not authorised." };
    }

    await db.$transaction(async (tx) => {
      await tx.mealEntry.delete({ where: { id: mealEntryId } });

      // Decrement the daily log totals — clamp to 0 so we never go negative
      const log = await tx.nutritionLog.findUnique({
        where: { id: entry.nutritionLogId },
        select: { totalCalories: true, totalProtein: true, totalCarbs: true, totalFat: true },
      });

      if (log) {
        await tx.nutritionLog.update({
          where: { id: entry.nutritionLogId },
          data: {
            totalCalories: Math.max(0, log.totalCalories - entry.calories),
            totalProtein: Math.max(0, log.totalProtein - entry.protein),
            totalCarbs: Math.max(0, log.totalCarbs - entry.carbs),
            totalFat: Math.max(0, log.totalFat - entry.fat),
          },
        });
      }
    });

    revalidatePath("/nutrition");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[nutrition-actions] deleteMealEntryAction:", error);
    return { success: false, error: "Could not delete meal. Please try again." };
  }
}
