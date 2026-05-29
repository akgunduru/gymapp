import Link from "next/link";
import { Dumbbell, LogOut, Zap } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import type { CurrentUser } from "@/lib/auth";

const ROLE_BADGE: Record<string, string> = {
  ADMIN:     "bg-gradient-to-r from-orange-500 to-pink-500 text-white",
  TRAINER:   "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
  DIETITIAN: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white",
  USER:      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
};

export function Navbar({ user }: { user: CurrentUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-white/80 backdrop-blur-2xl shadow-sm shadow-black/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
            <Dumbbell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 animate-pulse-ring" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold leading-none text-slate-900 tracking-tight">
              Social<span className="gradient-text">Gym</span>
            </span>
            <span className="text-xs text-slate-400 leading-none mt-0.5 hidden sm:block">Fitness community</span>
          </div>
        </Link>

        {/* Center — promo pill (desktop only) */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
          <Zap className="h-3 w-3 text-emerald-500" />
          Train together · Track smarter · Live healthier
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* User info chip */}
              <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                {/* Avatar initials */}
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white shadow-sm">
                  {(user.fullName ?? user.email).charAt(0).toUpperCase()}
                </div>
                <div className="text-right leading-none">
                  <p className="text-xs font-bold text-slate-800">
                    {user.fullName ?? user.email.split("@")[0]}
                  </p>
                  <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold ${ROLE_BADGE[user.role] ?? ROLE_BADGE.USER}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-500/30 transition hover:scale-105 hover:shadow-emerald-500/50"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
