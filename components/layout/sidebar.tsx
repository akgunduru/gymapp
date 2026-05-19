"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Apple,
  Dumbbell,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import type { CurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navIcons = {
  "/dashboard": LayoutDashboard,
  "/profile": User,
  "/gyms": MapPin,
  "/matches": Users,
  "/workouts": Dumbbell,
  "/nutrition": Apple,
  "/professionals": Stethoscope,
  "/consultations": Activity,
  "/messages": MessageCircle,
  "/admin": ShieldCheck,
} as const;

export function Sidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter((item) => item.href !== "/admin" || user.role === "ADMIN");

  return (
    <aside className="min-w-0 rounded-lg border border-slate-200/80 bg-white/95 p-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:sticky lg:top-20 lg:self-start">
      <nav
        aria-label="Primary navigation"
        className="scrollbar-none flex gap-1 overflow-x-auto lg:grid lg:overflow-visible"
      >
        {visibleItems.map((item) => {
          const Icon = navIcons[item.href];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
