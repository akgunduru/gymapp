"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileUpdateSchema } from "@/lib/validators";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getStringArray(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is string => typeof value === "string");
}

function redirectWithProfileError(message: string): never {
  redirect(`/profile?error=${encodeURIComponent(message)}`);
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const parsed = profileUpdateSchema.safeParse({
    fullName: getStringValue(formData, "fullName"),
    bio: getStringValue(formData, "bio"),
    city: getStringValue(formData, "city"),
    district: getStringValue(formData, "district"),
    address: getStringValue(formData, "address"),
    latitude: getStringValue(formData, "latitude"),
    longitude: getStringValue(formData, "longitude"),
    goals: getStringArray(formData, "goals"),
    level: getStringValue(formData, "level"),
    preferredMuscleGroups: getStringArray(formData, "preferredMuscleGroups"),
    weeklyWorkoutDays: getStringValue(formData, "weeklyWorkoutDays"),
    dailyCalorieGoal: getStringValue(formData, "dailyCalorieGoal"),
    dailyProteinGoal: getStringValue(formData, "dailyProteinGoal"),
    dailyCarbGoal: getStringValue(formData, "dailyCarbGoal"),
    dailyFatGoal: getStringValue(formData, "dailyFatGoal"),
  });

  if (!parsed.success) {
    redirectWithProfileError(parsed.error.issues[0]?.message ?? "Profile update failed.");
  }

  const data = parsed.data;

  await db.$transaction(async (tx) => {
    await tx.userProfile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        fullName: data.fullName,
        bio: data.bio,
        city: data.city,
        district: data.district,
      },
      create: {
        userId: user.id,
        fullName: data.fullName,
        bio: data.bio,
        city: data.city,
        district: data.district,
      },
    });

    await tx.fitnessPreference.upsert({
      where: {
        userId: user.id,
      },
      update: {
        goals: data.goals,
        level: data.level,
        preferredMuscleGroups: data.preferredMuscleGroups,
        weeklyWorkoutDays: data.weeklyWorkoutDays,
        dailyCalorieGoal: data.dailyCalorieGoal,
        dailyProteinGoal: data.dailyProteinGoal,
        dailyCarbGoal: data.dailyCarbGoal,
        dailyFatGoal: data.dailyFatGoal,
      },
      create: {
        userId: user.id,
        goals: data.goals,
        level: data.level,
        preferredMuscleGroups: data.preferredMuscleGroups,
        weeklyWorkoutDays: data.weeklyWorkoutDays,
        dailyCalorieGoal: data.dailyCalorieGoal,
        dailyProteinGoal: data.dailyProteinGoal,
        dailyCarbGoal: data.dailyCarbGoal,
        dailyFatGoal: data.dailyFatGoal,
      },
    });

    const currentPrimaryLocation = await tx.userLocation.findFirst({
      where: {
        userId: user.id,
        isPrimary: true,
      },
      select: {
        id: true,
      },
    });

    if (currentPrimaryLocation) {
      await tx.userLocation.update({
        where: {
          id: currentPrimaryLocation.id,
        },
        data: {
          label: "Primary location",
          city: data.city,
          district: data.district,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          isPrimary: true,
        },
      });
    } else {
      await tx.userLocation.create({
        data: {
          userId: user.id,
          label: "Primary location",
          city: data.city,
          district: data.district,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          isPrimary: true,
        },
      });
    }
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/profile?updated=1");
}
