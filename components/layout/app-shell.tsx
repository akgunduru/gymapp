import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar user={user} />
      <div
        className={cn(
          "mx-auto w-full max-w-7xl gap-5 px-4 py-5 sm:py-6 lg:px-6",
          user ? "grid lg:grid-cols-[228px_1fr]" : "block",
        )}
      >
        {user ? <Sidebar user={user} /> : null}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
