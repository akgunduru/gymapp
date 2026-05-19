import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireUser } from "@/lib/auth";

export default async function MatchingPage() {
  await requireUser();

  return (
    <PagePlaceholder
      eyebrow="Matching"
      title="Matching engine"
      description="This route is reserved for matching logic diagnostics and compatibility scoring."
    />
  );
}
