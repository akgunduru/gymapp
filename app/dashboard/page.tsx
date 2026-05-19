import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  return <DashboardPlaceholder user={user} />;
}
