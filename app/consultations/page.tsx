import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireUser } from "@/lib/auth";

export default async function ConsultationsPage() {
  await requireUser();

  return (
    <PagePlaceholder
      eyebrow="Consultations"
      title="Consultation requests"
      description="Consultation request workflows will be implemented after professional profiles."
    />
  );
}
