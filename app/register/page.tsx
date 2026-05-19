import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, UserPlus } from "lucide-react";
import { registerAction } from "@/lib/auth-actions";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_460px] lg:items-stretch">
      <section className="hidden rounded-lg bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Social Gym System
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-normal">Create your account</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Pick user, trainer, or dietitian. Professional verification stays admin-managed.
          </p>
        </div>
        <div className="grid gap-3 text-sm">
          {["USER profile", "TRAINER profile", "DIETITIAN profile"].map((item) => (
            <div key={item} className="rounded-md border border-white/10 bg-white/5 px-4 py-3">
              {item}
            </div>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
            <UserPlus className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Authentication
          </p>
          <CardTitle className="text-3xl">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={registerAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                autoComplete="name"
                required
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="Yusuf Kardogan"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-slate-700">
                Account type
              </label>
              <select
                id="role"
                name="role"
                defaultValue="USER"
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="USER">User</option>
                <option value="TRAINER">Trainer</option>
                <option value="DIETITIAN">Dietitian</option>
              </select>
            </div>

            {params?.error ? (
              <p className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
                {params.error}
              </p>
            ) : null}

            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
              Login <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
