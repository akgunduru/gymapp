import Link from "next/link";
import {
  ArrowRight,
  Dumbbell,
  Flame,
  Heart,
  MapPin,
  Salad,
  Star,
  Users,
  Zap,
  Trophy,
  TrendingUp,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Static data ────────────────────────────────────────── */
const stats = [
  { value: "12K+", label: "Active Members", icon: Users, color: "from-emerald-500 to-cyan-500" },
  { value: "340+", label: "Gyms Listed", icon: MapPin, color: "from-cyan-500 to-violet-500" },
  { value: "98%", label: "Satisfaction Rate", icon: Star, color: "from-violet-500 to-pink-500" },
  { value: "4.2K", label: "Workouts Logged", icon: Flame, color: "from-orange-500 to-pink-500" },
];

const features = [
  {
    icon: MapPin,
    title: "Discover Gyms",
    description: "Find top-rated gyms in your city, explore equipment, memberships, and book a visit instantly.",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80",
    accent: "from-emerald-400 to-cyan-500",
    bg: "from-emerald-50 to-cyan-50",
  },
  {
    icon: Users,
    title: "Find Your Buddy",
    description: "Our smart matching engine connects you with gym partners who share your fitness goals and schedule.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
    accent: "from-violet-400 to-purple-600",
    bg: "from-violet-50 to-purple-50",
  },
  {
    icon: Dumbbell,
    title: "Workout Plans",
    description: "Access expert-designed training plans for every goal — strength, cardio, HIIT, and more.",
    image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&q=80",
    accent: "from-orange-400 to-pink-500",
    bg: "from-orange-50 to-pink-50",
  },
  {
    icon: Salad,
    title: "Nutrition Tracking",
    description: "Log meals, analyze macros, and get AI-powered nutrition advice tailored to your body.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
    accent: "from-cyan-400 to-blue-500",
    bg: "from-cyan-50 to-blue-50",
  },
];

const testimonials = [
  {
    name: "Alex M.",
    role: "Amateur Powerlifter",
    text: "Found my training partner in 2 days. We now hit the gym 5 times a week together — game changer!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",
    stars: 5,
  },
  {
    name: "Sarah K.",
    role: "Nutrition Enthusiast",
    text: "The meal tracking is insanely good. Clean UI, smart suggestions, and it actually keeps me on track.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
    stars: 5,
  },
  {
    name: "Jordan R.",
    role: "Personal Trainer",
    text: "I use it to connect with clients and share plans. The professional tools make my sessions much more effective.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
    stars: 5,
  },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] overflow-hidden rounded-2xl">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=85"
          alt="Fitness hero"
          className="img-cover"
          style={{ objectPosition: "center 30%" }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-emerald-950/70 to-slate-950/80" />
        {/* Floating accent blob */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

        {/* Hero content */}
        <div className="relative z-10 flex min-h-[88vh] flex-col justify-center px-6 py-20 sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              Your ultimate fitness community platform
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up-delay-1 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Train Smarter.
              <br />
              <span className="gradient-text">Connect Deeper.</span>
              <br />
              Live Better.
            </h1>

            {/* Sub-headline */}
            <p className="animate-fade-in-up-delay-2 mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Discover gyms, match with fitness buddies, follow expert workout plans, and track your nutrition — all in one vibrant social fitness platform.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up-delay-3 mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/50"
              >
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <PlayCircle className="h-4 w-4" />
                Explore platform
              </Link>
            </div>

            {/* Micro stats */}
            <div className="animate-fade-in-up-delay-4 mt-12 flex flex-wrap gap-6">
              {[
                { label: "Members", val: "12K+" },
                { label: "Gyms", val: "340+" },
                { label: "Rating", val: "4.9 ★" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-extrabold text-white">{s.val}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating card preview (right side, desktop only) */}
          <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block xl:right-16">
            <div className="animate-float w-72 rounded-2xl bg-white/10 p-5 backdrop-blur-xl border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&q=80"
                  alt="User"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-400"
                />
                <div>
                  <p className="text-sm font-semibold text-white">Maya K. just matched!</p>
                  <p className="text-xs text-emerald-300">Strength · Advanced · 5×/week</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/70">
                  <span>Today's workout</span>
                  <span className="text-emerald-400 font-semibold">68%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "68%" }} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[["🔥", "420", "kcal"], ["⚡", "47", "min"], ["💪", "3", "sets"]].map(([emoji, val, unit]) => (
                  <div key={unit} className="rounded-xl bg-white/10 py-2">
                    <div className="text-lg">{emoji}</div>
                    <div className="text-sm font-bold text-white">{val}</div>
                    <div className="text-xs text-white/50">{unit}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Animated Stats Bar ──────────────────────────────── */}
      <section className="my-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 p-px shadow-xl shadow-emerald-500/20">
        <div className="rounded-2xl bg-slate-950/95 px-6 py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-2 text-center animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-3xl font-extrabold text-white stat-number">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Feature Cards ──────────────────────────────────── */}
      <section className="my-12 space-y-6">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">Everything you need</p>
          <h2 className="mt-2 text-4xl font-extrabold text-slate-900">
            One platform.{" "}
            <span className="gradient-text">All your fitness.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            From discovering nearby gyms to finding your perfect workout partner — we built it all.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`card-hover group relative overflow-hidden rounded-2xl bg-gradient-to-br ${f.bg} border border-white shadow-md`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={f.image}
                    alt={f.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className={`absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} shadow-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                {/* Text */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Social Proof / Lifestyle Imagery ────────────────── */}
      <section className="my-12 overflow-hidden rounded-2xl">
        <div className="grid lg:grid-cols-2">
          {/* Left: big image */}
          <div className="relative min-h-[380px]">
            <img
              src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=85"
              alt="Community fitness"
              className="img-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/40" />
            {/* Floating achievement pill */}
            <div className="absolute bottom-6 left-6">
              <div className="glass-white flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Monthly Challenge</p>
                  <p className="text-sm font-bold text-slate-800">🏆 Top 5% this week!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: content */}
          <div className="flex flex-col justify-center bg-gradient-to-br from-slate-950 to-emerald-950 p-10 text-white">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Community first</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight">
              Never train<br />
              <span className="gradient-text">alone again.</span>
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Our AI-powered buddy matching system pairs you with gym partners based on your goals, experience level, preferred schedule, and gym location.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: TrendingUp, label: "Progress tracking", desc: "Visual streak & milestone charts" },
                { icon: Users,      label: "Buddy matching",   desc: "Smart AI-powered pairing" },
                { icon: Heart,      label: "Wellness score",   desc: "Holistic health insights" },
                { icon: Zap,        label: "Live challenges",  desc: "Compete with the community" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                      <Icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/register"
              className="mt-10 inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
            >
              Join the community
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Nutrition / Wellness Banner ─────────────────────── */}
      <section className="my-8 grid gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl min-h-[280px]">
          <img
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=80"
            alt="Healthy nutrition"
            className="img-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <span className="mb-2 inline-block rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-300 border border-cyan-500/30">
              Nutrition
            </span>
            <h3 className="text-2xl font-extrabold text-white">Eat well. Feel great.</h3>
            <p className="mt-1 text-sm text-slate-300">AI meal analysis, macro tracking, and personalized plans.</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl min-h-[280px]">
          <img
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&q=80"
            alt="Wellness training"
            className="img-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-violet-950/80 via-violet-950/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <span className="mb-2 inline-block rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-violet-300 border border-violet-500/30">
              Coaching
            </span>
            <h3 className="text-2xl font-extrabold text-white">Professional guidance.</h3>
            <p className="mt-1 text-sm text-slate-300">Connect with certified trainers and dietitians near you.</p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="my-12">
        <div className="text-center mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600">Loved by thousands</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Real people. <span className="gradient-text-cyan">Real results.</span>
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="card-hover rounded-2xl border border-slate-100 bg-white p-6 shadow-md"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-orange-400 text-orange-400" />
                ))}
              </div>
              <p className="text-sm leading-7 text-slate-600 italic">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-200" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="my-8 overflow-hidden rounded-2xl">
        <div className="relative px-8 py-16 text-center">
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80"
            alt="CTA background"
            className="img-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-slate-900/85 to-violet-900/90" />
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
              Ready to transform<br />
              <span className="gradient-text">your fitness journey?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-slate-300">
              Join thousands of members who are already smashing their goals, connecting with buddies, and living healthier lives.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-500/40 transition-all hover:scale-105"
              >
                Get started — it's free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Login to your account
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
