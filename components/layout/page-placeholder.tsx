import {
  ArrowRight,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Lock,
  MapPin,
  MessageCircle,
  Salad,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */
type PagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

/* ─── Mock data by page ──────────────────────────────────── */
const GYM_CARDS = [
  {
    name: "Iron Peak Fitness",
    city: "Istanbul",
    rating: 4.9,
    members: "2.4K",
    tags: ["Powerlifting", "CrossFit", "Sauna"],
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
    badge: "Top Rated",
    badgeColor: "from-emerald-500 to-cyan-500",
  },
  {
    name: "Pulse Wellness Club",
    city: "Ankara",
    rating: 4.7,
    members: "1.8K",
    tags: ["Yoga", "HIIT", "Pool"],
    img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80",
    badge: "Trending",
    badgeColor: "from-violet-500 to-pink-500",
  },
  {
    name: "EliteForge Gym",
    city: "Izmir",
    rating: 4.8,
    members: "3.1K",
    tags: ["Bodybuilding", "Cardio", "PT"],
    img: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400&q=80",
    badge: "Premium",
    badgeColor: "from-orange-500 to-pink-500",
  },
];

const WORKOUT_CARDS = [
  {
    name: "Full Body Blast",
    duration: "45 min",
    level: "Intermediate",
    calories: 480,
    img: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&q=80",
    gradient: "from-orange-500 to-pink-500",
    muscles: ["Full Body", "Core"],
  },
  {
    name: "Push Day Power",
    duration: "55 min",
    level: "Advanced",
    calories: 520,
    img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80",
    gradient: "from-violet-500 to-purple-600",
    muscles: ["Chest", "Shoulders", "Triceps"],
  },
  {
    name: "Morning Cardio",
    duration: "30 min",
    level: "Beginner",
    calories: 310,
    img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80",
    gradient: "from-cyan-500 to-blue-600",
    muscles: ["Cardio", "Legs"],
  },
];

const BUDDY_CARDS = [
  {
    name: "Selin T.",
    goal: "Build Muscle",
    level: "Advanced",
    days: "Mon · Wed · Fri",
    match: 96,
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80",
    tags: ["Powerlifting", "HIIT"],
  },
  {
    name: "Kemal D.",
    goal: "Strength",
    level: "Intermediate",
    days: "Tue · Thu · Sat",
    match: 91,
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
    tags: ["Bodybuilding", "Cardio"],
  },
  {
    name: "Ayşe K.",
    goal: "Health",
    level: "Beginner",
    days: "Mon · Wed · Sun",
    match: 88,
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
    tags: ["Yoga", "Running"],
  },
];

const NUTRITION_CARDS = [
  {
    name: "Grilled Chicken Bowl",
    calories: 520,
    protein: 46,
    carbs: 38,
    fat: 14,
    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",
    tag: "High Protein",
    tagColor: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Avocado Toast",
    calories: 340,
    protein: 12,
    carbs: 32,
    fat: 18,
    img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80",
    tag: "Balanced",
    tagColor: "bg-cyan-100 text-cyan-700",
  },
  {
    name: "Berry Protein Shake",
    calories: 280,
    protein: 34,
    carbs: 22,
    fat: 6,
    img: "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?w=400&q=80",
    tag: "Post-Workout",
    tagColor: "bg-violet-100 text-violet-700",
  },
];

const PROFESSIONAL_CARDS = [
  {
    name: "Mert Arslan",
    role: "Personal Trainer",
    specialties: ["Hypertrophy", "Fat Loss", "Rehab"],
    rating: 4.9,
    sessions: 314,
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80",
  },
  {
    name: "Dr. Leyla Şen",
    role: "Dietitian",
    specialties: ["Sports Nutrition", "Weight Management"],
    rating: 4.8,
    sessions: 228,
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
  },
  {
    name: "Hakan Kaya",
    role: "Fitness Coach",
    specialties: ["Calisthenics", "HIIT", "Mindfulness"],
    rating: 4.7,
    sessions: 190,
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
];

const MESSAGE_PREVIEWS = [
  {
    name: "Selin T.",
    msg: "Hey! Are you free for a session Thursday morning?",
    time: "2m ago",
    unread: 2,
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80",
    online: true,
  },
  {
    name: "Mert Arslan",
    msg: "Your new program is ready — check it out! 🔥",
    time: "1h ago",
    unread: 1,
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&q=80",
    online: false,
  },
  {
    name: "EliteForge Gym",
    msg: "You're confirmed for tomorrow's 09:00 session.",
    time: "3h ago",
    unread: 0,
    img: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=80&q=80",
    online: true,
  },
];

/* ─── Page-specific rich layouts ─────────────────────────── */
function GymsPreview() {
  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <div className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 flex items-center text-sm text-slate-400 shadow-sm">
            Search gyms in your city…
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md">
          <Zap className="h-4 w-4" /> Search
        </div>
      </div>
      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {GYM_CARDS.map((gym) => (
          <div key={gym.name} className="card-hover group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md">
            <div className="relative h-40 overflow-hidden">
              <img src={gym.img} alt={gym.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className={`absolute top-3 right-3 rounded-full bg-gradient-to-r ${gym.badgeColor} px-2.5 py-1 text-xs font-bold text-white shadow`}>
                {gym.badge}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{gym.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="h-3 w-3" /> {gym.city}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-600">{gym.rating}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {gym.tags.map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{t}</span>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">{gym.members} members</p>
            </div>
          </div>
        ))}
      </div>
      <ComingSoonBanner feature="Detailed gym profiles, live slot booking, and photo galleries" />
    </div>
  );
}

function WorkoutsPreview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {["All", "Strength", "Cardio", "HIIT", "Yoga", "Calisthenics"].map((tab, i) => (
          <span key={tab} className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition ${i === 0 ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {tab}
          </span>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {WORKOUT_CARDS.map((w) => (
          <div key={w.name} className="card-hover group relative overflow-hidden rounded-2xl shadow-md">
            <div className="relative h-44 overflow-hidden">
              <img src={w.img} alt={w.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-base font-bold text-white">{w.name}</h3>
                <div className="mt-1 flex gap-3 text-xs text-white/80">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{w.duration}</span>
                  <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-400" />{w.calories} kcal</span>
                </div>
              </div>
              <div className={`absolute top-3 right-3 rounded-full bg-gradient-to-r ${w.gradient} px-2.5 py-1 text-xs font-bold text-white`}>
                {w.level}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 bg-white px-4 py-3">
              {w.muscles.map((m) => (
                <span key={m} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{m}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ComingSoonBanner feature="Exercise library, video demos, and custom plan builder" />
    </div>
  );
}

function MatchesPreview() {
  return (
    <div className="space-y-6">
      {/* Match score banner */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-200">AI Buddy Matching</p>
            <h3 className="mt-1 text-2xl font-extrabold">3 new matches today!</h3>
            <p className="mt-1 text-sm text-violet-200">Based on your goals, schedule & gym location</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
      {/* Buddy cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {BUDDY_CARDS.map((b) => (
          <div key={b.name} className="card-hover relative rounded-2xl border border-slate-100 bg-white p-5 shadow-md">
            <div className="flex items-start gap-4">
              <img src={b.img} alt={b.name} className="h-14 w-14 rounded-2xl object-cover ring-2 ring-violet-200" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800">{b.name}</p>
                  <span className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-2.5 py-0.5 text-xs font-bold text-white">
                    {b.match}%
                  </span>
                </div>
                <p className="text-xs text-slate-500">{b.goal} · {b.level}</p>
                <p className="mt-1 text-xs text-slate-400">{b.days}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {b.tags.map((t) => (
                <span key={t} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">{t}</span>
              ))}
            </div>
            <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90">
              Connect
            </button>
          </div>
        ))}
      </div>
      <ComingSoonBanner feature="Live chat, joint workout scheduling, and challenge invites" />
    </div>
  );
}

function NutritionPreview() {
  return (
    <div className="space-y-6">
      {/* Daily macro ring */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 p-6 text-white shadow-xl">
        <p className="text-sm font-semibold text-cyan-200">Today's intake</p>
        <div className="mt-3 grid grid-cols-4 gap-4 text-center">
          {[
            { label: "Calories", val: "1,840", max: "2,200", color: "from-orange-400 to-pink-400" },
            { label: "Protein", val: "128g", max: "160g", color: "from-emerald-400 to-cyan-400" },
            { label: "Carbs", val: "210g", max: "280g", color: "from-cyan-400 to-blue-400" },
            { label: "Fats", val: "62g", max: "80g", color: "from-violet-400 to-purple-400" },
          ].map((m) => (
            <div key={m.label}>
              <div className={`text-2xl font-extrabold bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}>{m.val}</div>
              <div className="text-xs text-blue-200">{m.label}</div>
              <div className="text-xs text-blue-300/70">/ {m.max}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Meal cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {NUTRITION_CARDS.map((n) => (
          <div key={n.name} className="card-hover group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md">
            <div className="relative h-40 overflow-hidden">
              <img src={n.img} alt={n.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold ${n.tagColor} shadow`}>
                {n.tag}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-800">{n.name}</h3>
              <div className="mt-2 grid grid-cols-4 gap-1 text-center">
                {[
                  ["Cal", n.calories],
                  ["Pro", `${n.protein}g`],
                  ["Carb", `${n.carbs}g`],
                  ["Fat", `${n.fat}g`],
                ].map(([label, val]) => (
                  <div key={String(label)} className="rounded-lg bg-slate-50 py-1.5">
                    <div className="text-xs font-bold text-slate-700">{val}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <ComingSoonBanner feature="AI meal photo analysis, diet plans, and hydration tracker" />
    </div>
  );
}

function ProfessionalsPreview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {PROFESSIONAL_CARDS.map((p) => (
          <div key={p.name} className="card-hover rounded-2xl border border-slate-100 bg-white p-6 shadow-md text-center">
            <img src={p.img} alt={p.name} className="mx-auto h-20 w-20 rounded-2xl object-cover ring-4 ring-emerald-100" />
            <h3 className="mt-4 font-bold text-slate-800">{p.name}</h3>
            <p className="text-sm text-emerald-600 font-semibold">{p.role}</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-amber-600">{p.rating}</span>
              <span className="text-xs text-slate-400">({p.sessions} sessions)</span>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {p.specialties.map((s) => (
                <span key={s} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{s}</span>
              ))}
            </div>
            <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90">
              Book session
            </button>
          </div>
        ))}
      </div>
      <ComingSoonBanner feature="Online consultations, messaging, and session history" />
    </div>
  );
}

function MessagesPreview() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-emerald-900 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold">
            <MessageCircle className="h-5 w-5 text-emerald-400" />
            Messages
          </div>
          <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white">3 new</span>
        </div>
        {/* Conversation list */}
        <div className="divide-y divide-slate-50">
          {MESSAGE_PREVIEWS.map((m) => (
            <div key={m.name} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 cursor-pointer">
              <div className="relative">
                <img src={m.img} alt={m.name} className="h-12 w-12 rounded-2xl object-cover" />
                {m.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">{m.name}</p>
                  <span className="text-xs text-slate-400">{m.time}</span>
                </div>
                <p className="truncate text-sm text-slate-500">{m.msg}</p>
              </div>
              {m.unread > 0 && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-xs font-bold text-white">
                  {m.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <ComingSoonBanner feature="Real-time chat, voice messages, and group conversations" />
    </div>
  );
}

function ConsultationsPreview() {
  return (
    <div className="space-y-6">
      {/* Upcoming appointment */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-pink-600 p-6 text-white shadow-xl">
        <p className="text-sm font-semibold text-orange-100">Next appointment</p>
        <h3 className="mt-1 text-2xl font-extrabold">Nutrition Check-in</h3>
        <p className="mt-1 text-sm text-orange-100">With Dr. Leyla Şen · Tomorrow at 10:00</p>
        <div className="mt-4 flex gap-3">
          <button className="rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/25">
            Reschedule
          </button>
          <button className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow hover:bg-orange-50">
            Join session
          </button>
        </div>
      </div>
      {/* History rows */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md">
        <h4 className="mb-4 font-bold text-slate-800">Recent consultations</h4>
        <div className="space-y-3">
          {[
            { title: "Workout Plan Review", with: "Mert Arslan", date: "May 20", status: "Completed" },
            { title: "Macro Adjustment", with: "Dr. Leyla Şen", date: "May 14", status: "Completed" },
            { title: "Progress Assessment", with: "Mert Arslan", date: "May 6", status: "Completed" },
          ].map((c) => (
            <div key={c.date} className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-slate-800">{c.title}</p>
                <p className="text-xs text-slate-500">with {c.with} · {c.date}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">{c.status}</span>
            </div>
          ))}
        </div>
      </div>
      <ComingSoonBanner feature="Book sessions, video calls, and shared workout plans" />
    </div>
  );
}

function GenericPreview({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl min-h-[280px]">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80"
          alt={title}
          className="img-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-emerald-950/70 to-slate-950/80" />
        <div className="relative z-10 flex min-h-[280px] flex-col justify-center px-8">
          <h2 className="text-3xl font-extrabold text-white">{title}</h2>
          <p className="mt-3 max-w-xl text-slate-300">{description}</p>
        </div>
      </div>
      <ComingSoonBanner feature="Full feature set launching soon — stay tuned!" />
    </div>
  );
}

/* ─── Coming Soon Banner ─────────────────────────────────── */
function ComingSoonBanner({ feature }: { feature: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow">
        <Lock className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-violet-800">Coming next</p>
        <p className="text-xs text-violet-600">{feature}</p>
      </div>
      <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-violet-600">
        <TrendingUp className="h-3.5 w-3.5" />
        In progress
      </div>
    </div>
  );
}

/* ─── Hero header ────────────────────────────────────────── */
const PAGE_META: Record<string, {
  icon: React.ElementType;
  gradient: string;
  heroImg: string;
  render: () => React.ReactNode;
}> = {
  Gyms:          { icon: MapPin,         gradient: "from-emerald-600 to-cyan-600",    heroImg: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", render: GymsPreview },
  Workouts:      { icon: Dumbbell,       gradient: "from-orange-500 to-pink-600",     heroImg: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80", render: WorkoutsPreview },
  "Buddy Matches":{ icon: Users,         gradient: "from-violet-600 to-purple-700",   heroImg: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80", render: MatchesPreview },
  Nutrition:     { icon: Salad,          gradient: "from-cyan-500 to-blue-600",       heroImg: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80", render: NutritionPreview },
  Professionals: { icon: Heart,          gradient: "from-emerald-500 to-teal-600",    heroImg: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", render: ProfessionalsPreview },
  Consultations: { icon: TrendingUp,     gradient: "from-orange-500 to-pink-500",     heroImg: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80", render: ConsultationsPreview },
  Messages:      { icon: MessageCircle,  gradient: "from-slate-700 to-emerald-800",   heroImg: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80", render: MessagesPreview },
};

/* ─── Main export ────────────────────────────────────────── */
export function PagePlaceholder({ eyebrow, title, description }: PagePlaceholderProps) {
  const meta = PAGE_META[title] ?? null;
  const Icon = meta?.icon ?? Zap;
  const gradient = meta?.gradient ?? "from-emerald-600 to-cyan-600";
  const heroImg = meta?.heroImg ?? "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80";

  return (
    <div className="space-y-6">
      {/* Page hero header */}
      <div className="relative overflow-hidden rounded-2xl">
        <img src={heroImg} alt={title} className="img-cover" style={{ height: "220px", position: "relative" }} />
        <div className="h-[220px]">
          <img src={heroImg} alt={title} className="img-cover" />
          <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-85`} />
          <div className="absolute inset-0 flex items-center px-8">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
                <Icon className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-white/70">{eyebrow}</p>
                <h1 className="text-3xl font-extrabold text-white">{title}</h1>
                <p className="mt-1 max-w-md text-sm text-white/80">{description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page-specific content */}
      {meta ? (
        <meta.render />
      ) : (
        <GenericPreview title={title} description={description} />
      )}
    </div>
  );
}
