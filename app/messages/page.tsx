import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireUser } from "@/lib/auth";

export default async function MessagesPage() {
  await requireUser();

  return (
    <PagePlaceholder
      eyebrow="Messaging"
      title="Messages"
      description="Persistent conversations and message threads will be implemented in the messaging module."
    />
  );
}
