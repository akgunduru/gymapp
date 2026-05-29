import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfessionalsClient } from "@/components/professionals/professionals-client";

export const metadata = {
  title: "Professionals — Social Gym",
};

export default async function ProfessionalsPage() {
  const me = await requireUser();

  /* Fetch current user's fitness goals for compatibility scoring */
  const pref = await db.fitnessPreference.findUnique({
    where: { userId: me.id },
    select: { goals: true },
  });

  const userGoals = pref?.goals.map((g) => g as string) ?? [];

  return <ProfessionalsClient userGoals={userGoals} />;
}
