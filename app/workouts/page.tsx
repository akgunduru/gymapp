import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireUser } from "@/lib/auth";

export default async function WorkoutsPage() {
  await requireUser();

  return (
    <PagePlaceholder
      eyebrow="Recommendations"
      title="Workouts"
      description="Workout recommendations by muscle group and level will be added here."
    />
  );
}
