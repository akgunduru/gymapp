import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { loginAction } from "@/lib/auth-actions";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_420px] lg:items-stretch">
      <section className="hidden rounded-lg bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Social Gym System
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-normal">Welcome back</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Continue with seeded demo data, protected routes, and the profile module.
          </p>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3">
            Admin: admin@socialgym.test
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3">
            User: ece.user@socialgym.test
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3">
            Password: DemoPass123!
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Authentication
          </p>
          <CardTitle className="text-3xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
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
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-0 transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="admin@socialgym.test"
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
                autoComplete="current-password"
                required
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-0 transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="DemoPass123!"
              />
            </div>

            {params?.error ? (
              <p className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
                {params.error}
              </p>
            ) : null}

            <Button type="submit" className="w-full">
              <Mail className="h-4 w-4" />
              Login
            </Button>
          </form>

          <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 lg:hidden">
            <p className="font-medium text-slate-800">Demo account</p>
            <p className="mt-1">admin@socialgym.test</p>
            <p>DemoPass123!</p>
          </div>

          <p className="mt-5 text-center text-sm text-slate-600">
            No account yet?{" "}
            <Link href="/register" className="font-medium text-emerald-700 hover:text-emerald-800">
              Register <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
