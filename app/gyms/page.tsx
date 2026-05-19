import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireUser } from "@/lib/auth";

export default async function GymsPage() {
  await requireUser();

  return (
    <PagePlaceholder
      eyebrow="Discovery"
      title="Gyms"
      description="Leaflet/OpenStreetMap gym discovery will be implemented in a later module."
    />
  );
}
