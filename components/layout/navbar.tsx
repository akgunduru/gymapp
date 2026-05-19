import Link from "next/link";
import { Dumbbell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth-actions";
import type { CurrentUser } from "@/lib/auth";

export function Navbar({ user }: { user: CurrentUser | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-700 text-white shadow-sm">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-slate-950 sm:text-base">
            Social Gym System
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-right sm:block">
                <p className="text-sm font-medium text-slate-950">
                  {user.fullName ?? user.email}
                </p>
                <p className="text-xs font-medium text-slate-500">{user.role}</p>
              </div>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" className="px-3 sm:px-4">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
