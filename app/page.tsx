import Link from "next/link";
import { ArrowRight, Dumbbell, MapPin, ShieldCheck, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const foundationCards = [
  {
    title: "Modular monolith",
    description: "Next.js App Router structure prepared for isolated feature modules.",
    icon: Dumbbell,
  },
  {
    title: "PostgreSQL ready",
    description: "Prisma is initialized with a datasource and seed entry point.",
    icon: ShieldCheck,
  },
  {
    title: "Fitness modules",
    description: "Routes are prepared for gyms, matching, workouts, nutrition, and admin.",
    icon: MapPin,
  },
  {
    title: "Nutrition base",
    description: "Meal tracking and mock AI analysis have a dedicated module path.",
    icon: Utensils,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg bg-slate-950 px-6 py-10 text-white sm:px-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Web MVP in progress
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
              Social Gym System
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
              A focused web version of the graduation project with authentication,
              profiles, PostgreSQL data, and module-by-module implementation.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard">
                  Open app
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 text-sm">
            {["Users", "Gyms", "Workouts", "Nutrition"].map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-white/5 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {foundationCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
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
