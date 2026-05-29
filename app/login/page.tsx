import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Dumbbell, LockKeyhole, Mail } from "lucide-react";
import { loginAction } from "@/lib/auth-actions";
import { getCurrentUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;

  return (
    /* ── Full-page hero background ─────────────────────────── */
    <div className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden rounded-2xl">

      {/* Gym background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80')",
        }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-emerald-950/70 to-slate-900/85" />

      {/* Floating blobs */}
      <div
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #10b981, transparent)",
          animation: "blob 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, #06b6d4, transparent)",
          animation: "blob 10s ease-in-out infinite reverse",
        }}
      />

      {/* ── Card ──────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm px-4">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-2xl shadow-emerald-500/40">
            <Dumbbell className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Sign in to your SocialGym account
          </p>
        </div>

        {/* Glass form card */}
        <div className="rounded-2xl border border-white/15 bg-white/8 p-7 shadow-2xl backdrop-blur-xl">
          <form action={loginAction} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue="admin@socialgym.test"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/6 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-slate-300">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  defaultValue="DemoPass123!"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/6 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error */}
            {params?.error && (
              <p className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
                {params.error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="mt-1 h-11 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-black text-white shadow-lg shadow-emerald-500/30 transition hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-5 rounded-xl border border-white/8 bg-white/4 p-3">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Demo accounts
            </p>
            <div className="space-y-1 text-xs text-slate-400 font-mono">
              <p>admin@socialgym.test</p>
              <p>ece.user@socialgym.test</p>
              <p className="text-emerald-400 font-semibold">Password: DemoPass123!</p>
            </div>
          </div>

          {/* Register link */}
          <p className="mt-5 text-center text-sm text-slate-500">
            No account yet?{" "}
            <Link
              href="/register"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Register <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
