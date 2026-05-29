import {
  NutritionAnalyzerClient,
  type NutritionHistoryLog,
} from "@/components/nutrition/nutrition-analyzer-client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { NutritionGoal } from "@/lib/nutrition-parser";

function goalFromPreference(goals: string[]): NutritionGoal {
  if (goals.includes("LOSE_WEIGHT")) return "fat_loss";
  if (goals.includes("BUILD_MUSCLE") || goals.includes("STRENGTH")) return "muscle_gain";
  return "healthy_lifestyle";
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function NutritionPage() {
  const user = await requireUser();

  const [profileData, logs] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: {
        fitnessPreference: {
          select: {
            goals: true,
            dailyCalorieGoal: true,
            dailyProteinGoal: true,
            dailyCarbGoal: true,
            dailyFatGoal: true,
          },
        },
      },
    }),
    db.nutritionLog.findMany({
      where: { userId: user.id },
      orderBy: { logDate: "desc" },
      take: 7,
      select: {
        id: true,
        logDate: true,
        totalCalories: true,
        totalProtein: true,
        totalCarbs: true,
        totalFat: true,
        mealEntries: {
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true,
            name: true,
            mealType: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
            createdAt: true,
          },
        },
      },
    }),
  ]);

  const preference = profileData?.fitnessPreference;
  const history: NutritionHistoryLog[] = logs.map((log) => ({
    id: log.id,
    logDate: dateKey(log.logDate),
    totalCalories: log.totalCalories,
    totalProtein: log.totalProtein,
    totalCarbs: log.totalCarbs,
    totalFat: log.totalFat,
    meals: log.mealEntries.map((meal) => ({
      id: meal.id,
      name: meal.name,
      mealType: meal.mealType,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      createdAt: meal.createdAt.toISOString(),
    })),
  }));

  return (
    <NutritionAnalyzerClient
      initialGoal={goalFromPreference((preference?.goals ?? []) as string[])}
      targets={{
        calories: preference?.dailyCalorieGoal ?? 2200,
        protein: preference?.dailyProteinGoal ?? 120,
        carbs: preference?.dailyCarbGoal ?? 250,
        fat: preference?.dailyFatGoal ?? 70,
      }}
      history={history}
    />
  );
}
