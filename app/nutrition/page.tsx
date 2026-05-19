import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireUser } from "@/lib/auth";

export default async function NutritionPage() {
  await requireUser();

  return (
    <PagePlaceholder
      eyebrow="Tracking"
      title="Nutrition"
      description="Daily calories, macros, meal image upload, and mock AI analysis will be added here."
    />
  );
}
