import Link from "next/link";
import {
  Activity,
  Apple,
  ArrowRight,
  Award,
  Bell,
  Dumbbell,
  Flame,
  Heart,
  MapPin,
  MessageCircle,
  Moon,
  Salad,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type { CurrentUser } from "@/lib/auth";

/* ─── Mock data ──────────────────────────────────────────── */
const STREAK_DAYS = [
  { label: "M", active: true },
  { label: "T", active: true },
  { label: "W", active: true },
  { label: "T", active: false },
  { label: "F", active: true },
  { label: "S", active: true },
  { label: "S", active: false, today: true },
];

const NEARBY_GYMS = [
  { name: "Iron Peak Fitness", dist: "0.8 km", rating: 4.9, img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=75" },
  { name: "Pulse Wellness Club", dist: "1.4 km", rating: 4.7, img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&q=75" },
  { name: "EliteForge Gym", dist: "2.1 km", rating: 4.8, img: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=300&q=75" },
];

const BUDDY_MATCHES = [
  { name: "Selin T.", goal: "Build Muscle", match: 96, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=75", online: true },
  { name: "Kemal D.", goal: "Strength",     match: 91, img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=75", online: false },
  { name: "Ayşe K.", goal: "Health",        match: 88, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=75", online: true },
];

const RECENT_WORKOUTS = [
  { name: "Push Day Power",    duration: "55 min", kcal: 520, date: "Today",    gradient: "from-orange-500 to-pink-500" },
  { name: "Morning Cardio",    duration: "30 min", kcal: 310, date: "Yesterday", gradient: "from-cyan-500 to-blue-600" },
  { name: "Full Body Blast",   duration: "45 min", kcal: 480, date: "Wed",       gradient: "from-violet-500 to-purple-600" },
];

const MACRO_TODAY = [
  { label: "Protein",  current: 128, goal: 160, color: "#10b981", bg: "from-emerald-500 to-teal-500" },
  { label: "Carbs",    current: 210, goal: 280, color: "#06b6d4", bg: "from-cyan-500 to-blue-500" },
  { label: "Fats",     current: 62,  goal: 80,  color: "#8b5cf6", bg: "from-violet-500 to-purple-500" },
];

const ACTIVITY_BARS = [40, 65, 55, 80, 72, 90, 60];
const BAR_LABELS    = ["M", "T", "W", "T", "F", "S", "S"];

/* ─── Component ──────────────────────────────────────────── */
export function DashboardPlaceholder({ user }: { user: CurrentUser }) {
  const firstName = user.fullName?.split(" ")[0] ?? user.email.split("@")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">

      {/* ── Hero welcome banner ──────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl min-h-[200px]">
        <img
          src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&q=80"
          alt="Fitness background"
          className="img-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-emerald-950/75 to-slate-950/60" />

        {/* floating blobs */}
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-16 right-32 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative z-10 flex min-h-[200px] flex-col justify-center px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {hour >= 18
                  ? <Moon className="h-4 w-4 text-violet-400" />
                  : <Zap className="h-4 w-4 text-emerald-400" />
                }
                <span className="text-sm font-semibold text-emerald-300">{greeting},</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                {firstName} 👋
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">
                You're on a <span className="font-bold text-emerald-400">5-day streak</span> — keep it going! Your buddy Selin is waiting at the gym.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-3">
              {[
                { icon: Flame,      val: "420",  unit: "kcal",   color: "from-orange-500 to-pink-500" },
                { icon: Activity,   val: "47",   unit: "min",    color: "from-emerald-500 to-cyan-500" },
                { icon: Heart,      val: "76",   unit: "bpm",    color: "from-pink-500 to-rose-500" },
              ].map(({ icon: Icon, val, unit, color }) => (
                <div key={unit} className="flex flex-col items-center rounded-2xl bg-white/10 px-4 py-3 text-center backdrop-blur-sm border border-white/10">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow mb-1.5`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-xl font-extrabold text-white">{val}</div>
                  <div className="text-xs text-slate-400">{unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Row: Streak + Calories + Weekly Activity ─────────── */}
      <div className="grid gap-5 md:grid-cols-3">

        {/* Weekly streak */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Weekly Streak</p>
              <p className="text-2xl font-extrabold text-slate-800">5 🔥 days</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex justify-between">
            {STREAK_DAYS.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    d.today
                      ? "bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-md animate-pulse-ring"
                      : d.active
                      ? "bg-gradient-to-br from-emerald-400 to-cyan-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {d.active || d.today ? "✓" : "·"}
                </div>
                <span className="text-xs text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calorie ring */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Calories</p>
              <p className="text-2xl font-extrabold text-slate-800">1,840 <span className="text-base font-medium text-slate-400">/ 2,200</span></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
              <Flame className="h-6 w-6 text-white" />
            </div>
          </div>
          {/* macro bars */}
          <div className="space-y-2.5">
            {MACRO_TODAY.map((m) => {
              const pct = Math.round((m.current / m.goal) * 100);
              return (
                <div key={m.label}>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span className="font-semibold">{m.label}</span>
                    <span>{m.current}g / {m.goal}g</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill bg-gradient-to-r ${m.bg}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly activity chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Weekly Activity</p>
              <p className="text-2xl font-extrabold text-slate-800">6.2k <span className="text-sm font-medium text-emerald-500">+12%</span></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex h-20 items-end justify-between gap-1">
            {ACTIVITY_BARS.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    i === 5
                      ? "bg-gradient-to-t from-emerald-500 to-cyan-400"
                      : "bg-slate-100 hover:bg-emerald-100"
                  }`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-xs text-slate-400">{BAR_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Row: Recent Workouts + Nutrition Feed ─────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Recent workouts */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">Recent Workouts</span>
            </div>
            <Link href="/workouts" className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_WORKOUTS.map((w) => (
              <div key={w.name} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${w.gradient} shadow`}>
                  <Dumbbell className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-slate-800">{w.name}</p>
                  <p className="text-xs text-slate-400">{w.duration} · {w.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-500">{w.kcal}</p>
                  <p className="text-xs text-slate-400">kcal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition today */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
                <Salad className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">Today's Meals</span>
            </div>
            <Link href="/nutrition" className="flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { meal: "Breakfast", name: "Oat Porridge + Berries", kcal: 380, img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=80&q=70" },
              { meal: "Lunch",     name: "Grilled Chicken Bowl",   kcal: 520, img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=80&q=70" },
              { meal: "Snack",     name: "Berry Protein Shake",    kcal: 280, img: "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?w=80&q=70" },
            ].map((m) => (
              <div key={m.meal} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                <img src={m.img} alt={m.name} className="h-10 w-10 rounded-xl object-cover shadow-sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.meal}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-cyan-600">{m.kcal}</p>
                  <p className="text-xs text-slate-400">kcal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Row: Nearby Gyms + Buddy Matches ─────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Nearby gyms */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">Nearby Gyms</span>
            </div>
            <Link href="/gyms" className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Explore <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {NEARBY_GYMS.map((g) => (
              <div key={g.name} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition cursor-pointer group">
                <img src={g.img} alt={g.name} className="h-12 w-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-slate-800">{g.name}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" />{g.dist} away
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-600">{g.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buddy matches */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">Buddy Matches</span>
            </div>
            <Link href="/matches" className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700">
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {BUDDY_MATCHES.map((b) => (
              <div key={b.name} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                <div className="relative">
                  <img src={b.img} alt={b.name} className="h-11 w-11 rounded-2xl object-cover shadow-sm" />
                  {b.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-slate-800">{b.name}</p>
                  <p className="text-xs text-slate-400">{b.goal}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2.5 py-0.5 text-xs font-bold text-white shadow">
                    {b.match}%
                  </span>
                  <span className="text-xs text-slate-400">match</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Row: Messages preview + Quick links ──────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Messages */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-emerald-800">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">Messages</span>
              <span className="ml-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-xs font-bold text-white">3</span>
            </div>
            <Link href="/messages" className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-800">
              Open <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {[
            { name: "Selin T.", msg: "Are you free for a session Thursday morning?", time: "2m", unread: 2, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=70", online: true },
            { name: "Mert Arslan", msg: "Your new program is ready — check it out! 🔥", time: "1h", unread: 1, img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&q=70", online: false },
          ].map((m) => (
            <div key={m.name} className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition cursor-pointer">
              <div className="relative">
                <img src={m.img} alt={m.name} className="h-11 w-11 rounded-2xl object-cover" />
                {m.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-slate-800">{m.name}</p>
                  <span className="text-xs text-slate-400">{m.time} ago</span>
                </div>
                <p className="truncate text-xs text-slate-500">{m.msg}</p>
              </div>
              {m.unread > 0 && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-xs font-bold text-white">
                  {m.unread}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-3">
          {[
            { label: "My Profile",     href: "/profile",       icon: Bell,     gradient: "from-slate-700 to-slate-900",   desc: "Update goals & info" },
            { label: "Browse Workouts",href: "/workouts",      icon: Dumbbell,  gradient: "from-orange-500 to-pink-600",   desc: "Today's plan" },
            { label: "Log a Meal",     href: "/nutrition",     icon: Apple,     gradient: "from-cyan-500 to-blue-600",     desc: "Track macros" },
            { label: "Find a Buddy",   href: "/matches",       icon: Users,     gradient: "from-violet-500 to-purple-600", desc: "New matches waiting" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="card-hover flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm hover:shadow-md"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            );
          })}
        </div>

      </div>

    </div>
  );
}
