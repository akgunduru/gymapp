import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Dumbbell, Mail, UserPlus } from "lucide-react";
import { registerAction } from "@/lib/auth-actions";
import { getCurrentUser } from "@/lib/auth";

type RegisterPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
            "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80')",
        }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-violet-950/60 to-slate-900/85" />

      {/* Floating blobs */}
      <div
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #8b5cf6, transparent)",
          animation: "blob 9s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, #10b981, transparent)",
          animation: "blob 11s ease-in-out infinite reverse",
        }}
      />

      {/* ── Card ──────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm px-4 py-8">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500 shadow-2xl shadow-violet-500/40">
            <Dumbbell className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Create account
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Join the SocialGym community
          </p>
        </div>

        {/* Glass form card */}
        <div className="rounded-2xl border border-white/15 bg-white/8 p-7 shadow-2xl backdrop-blur-xl">
          <form action={registerAction} className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wide text-slate-300">
                Full name
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  required
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/6 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Your full name"
                />
              </div>
            </div>

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
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/6 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-slate-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
                placeholder="At least 8 characters"
              />
            </div>

            {/* Account type */}
            <div className="space-y-1.5">
              <label htmlFor="role" className="block text-xs font-bold uppercase tracking-wide text-slate-300">
                Account type
              </label>
              <select
                id="role"
                name="role"
                defaultValue="USER"
                className="h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="USER">User</option>
                <option value="TRAINER">Trainer</option>
                <option value="DIETITIAN">Dietitian</option>
              </select>
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
              className="mt-1 h-11 w-full rounded-xl bg-gradient-to-r from-violet-500 to-emerald-500 text-sm font-black text-white shadow-lg shadow-violet-500/30 transition hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Account
            </button>
          </form>

          {/* Login link */}
          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Login <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
