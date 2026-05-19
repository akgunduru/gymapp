import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  await requireRole("ADMIN");

  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Admin panel"
      description="Role-protected verification and management screens will be implemented after RBAC."
    />
  );
}
