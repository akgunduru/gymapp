import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireUser } from "@/lib/auth";

export default async function ProfessionalsPage() {
  await requireUser();

  return (
    <PagePlaceholder
      eyebrow="Professionals"
      title="Trainers and dietitians"
      description="Verified trainer and dietitian profiles will be listed here."
    />
  );
}
