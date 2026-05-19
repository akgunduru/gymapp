import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireUser } from "@/lib/auth";

export default async function MatchesPage() {
  await requireUser();

  return (
    <PagePlaceholder
      eyebrow="Gym buddy"
      title="Buddy matches"
      description="Location and preference based buddy matches will be shown here."
    />
  );
}
