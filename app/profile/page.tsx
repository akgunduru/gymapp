import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileClient } from "@/components/profile/profile-client";

type ProfilePageProps = {
  searchParams?: Promise<{ updated?: string; error?: string }>;
};

export const metadata = { title: "Profile — Social Gym" };

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await requireUser();
  const params = await searchParams;

  const profileData = await db.user.findUnique({
    where: { id: user.id },
    select: {
      email: true,
      role: true,
      profile: true,
      fitnessPreference: true,
      locations: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });

  const p = profileData?.profile;
  const pref = profileData?.fitnessPreference;
  const loc = profileData?.locations[0];

  return (
    <ProfileClient
      email={profileData?.email ?? user.email}
      role={profileData?.role ?? user.role}
      fullName={p?.fullName ?? user.fullName ?? ""}
      bio={p?.bio ?? ""}
      city={p?.city ?? loc?.city ?? ""}
      district={p?.district ?? loc?.district ?? ""}
      address={loc?.address ?? ""}
      latitude={loc?.latitude ?? 41.0435}
      longitude={loc?.longitude ?? 29.0042}
      level={pref?.level ?? "BEGINNER"}
      weeklyWorkoutDays={pref?.weeklyWorkoutDays ?? 3}
      goals={(pref?.goals ?? []) as string[]}
      preferredMuscleGroups={(pref?.preferredMuscleGroups ?? []) as string[]}
      dailyCalorieGoal={pref?.dailyCalorieGoal ?? 2200}
      dailyProteinGoal={pref?.dailyProteinGoal ?? 120}
      dailyCarbGoal={pref?.dailyCarbGoal ?? 250}
      dailyFatGoal={pref?.dailyFatGoal ?? 70}
      updated={params?.updated === "1"}
      error={params?.error ?? null}
    />
  );
}
