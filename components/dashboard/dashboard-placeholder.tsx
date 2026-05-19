import Link from "next/link";
import { Activity, MapPin, MessageCircle, ShieldCheck, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CurrentUser } from "@/lib/auth";

const cards = [
  {
    title: "Profile readiness",
    description: "Profile, location, goals, level, and macro targets are connected to PostgreSQL.",
    icon: ShieldCheck,
  },
  {
    title: "Gym discovery",
    description: "The next module can read seeded gyms and user city data.",
    icon: MapPin,
  },
  {
    title: "Workout base",
    description: "Seeded exercises and workout plans are ready for recommendation screens.",
    icon: Activity,
  },
  {
    title: "Nutrition today",
    description: "Daily calories and macros will be wired to meal entries later.",
    icon: Utensils,
  },
  {
    title: "Messages",
    description: "Conversation previews will be shown after messaging is implemented.",
    icon: MessageCircle,
  },
];

export function DashboardPlaceholder({ user }: { user: CurrentUser }) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-slate-950 px-5 py-6 text-white sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">MVP control center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Welcome, {user.fullName ?? user.email}. Your role is {user.role}. Complete
              profile data first; the remaining modules will attach to it.
            </p>
          </div>
          <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
            <Link href="/profile">Edit profile</Link>
          </Button>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-orange-50 text-orange-700">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
