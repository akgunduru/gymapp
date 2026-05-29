/* ──────────────────────────────────────────────────────────────
   professionals-data.ts
   Static mock data for the Professionals discovery page.
   No DB required — swap with real DB queries when ready.
────────────────────────────────────────────────────────────── */

export type ProfessionalRole = "TRAINER" | "DIETITIAN";

export type Testimonial = {
  author: string;
  text: string;
  rating: number;
  date: string;
};

export type ScheduleDay = {
  day: string;
  slots: string[];
};

export type Professional = {
  id: string;
  fullName: string;
  role: ProfessionalRole;
  headline: string;
  bio: string;
  image: string;
  bannerImage: string;
  city: string;
  district: string;
  gym: string | null;
  gymAddress: string | null;
  yearsExperience: number;
  specialties: string[];
  certifications: string[];
  languages: string[];
  rating: number;
  reviewsCount: number;
  sessionPrice: number; // TRY per session
  isOnline: boolean;
  isVerified: boolean;
  isPremium: boolean;
  weeklyAvailability: ScheduleDay[];
  transformations: number;
  clientsTotal: number;
  instagram: string | null;
  testimonials: Testimonial[];
  tags: string[];
  matchGoals: string[]; // FitnessGoal keys for compatibility
};

/* ─── Trainers ────────────────────────────────────────────── */
const TRAINERS: Professional[] = [
  {
    id: "pro-t-001",
    fullName: "Mert Arslan",
    role: "TRAINER",
    headline: "Strength & Functional Training Coach",
    bio: "NASM-certified coach with 6+ years helping clients build real-world strength. I specialize in progressive overload, movement quality, and building consistency through sustainable training habits. Every program I design is tailored around your life — not the other way around.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80",
    city: "Istanbul",
    district: "Beşiktaş",
    gym: "Peak Arena Beşiktaş",
    gymAddress: "Barbaros Bulvarı No:42, Beşiktaş",
    yearsExperience: 6,
    specialties: ["Strength Training", "Functional Fitness", "Bodybuilding", "Injury Prevention"],
    certifications: ["NASM-CPT", "FMS Level 2", "TRX Certified"],
    languages: ["Turkish", "English"],
    rating: 4.9,
    reviewsCount: 87,
    sessionPrice: 950,
    isOnline: true,
    isVerified: true,
    isPremium: true,
    transformations: 124,
    clientsTotal: 210,
    instagram: "@mertarslanfit",
    weeklyAvailability: [
      { day: "Mon", slots: ["07:00", "09:00", "18:00", "20:00"] },
      { day: "Tue", slots: ["07:00", "09:00", "18:00"] },
      { day: "Wed", slots: ["07:00", "10:00", "18:00", "20:00"] },
      { day: "Thu", slots: ["09:00", "18:00", "20:00"] },
      { day: "Fri", slots: ["07:00", "09:00"] },
      { day: "Sat", slots: ["09:00", "11:00"] },
    ],
    testimonials: [
      { author: "Burak K.", text: "Mert transformed my training completely. Lost 12kg and built serious strength in 4 months.", rating: 5, date: "Mar 2026" },
      { author: "Ayşe D.", text: "Best investment I've made for my fitness. His programs are tough but incredibly smart.", rating: 5, date: "Feb 2026" },
      { author: "Kemal Y.", text: "Very professional, always prepared, explains the 'why' behind every exercise.", rating: 5, date: "Jan 2026" },
    ],
    tags: ["#StrengthCoach", "#NASM", "#Hypertrophy", "#FunctionalFit"],
    matchGoals: ["STRENGTH", "BUILD_MUSCLE"],
  },
  {
    id: "pro-t-002",
    fullName: "Can Yılmaz",
    role: "TRAINER",
    headline: "Powerlifting & Performance Coach",
    bio: "National-level powerlifter turned full-time coach. I've coached athletes to 3 national podium finishes and helped over 180 everyday lifters hit their first 100kg squat. My philosophy: technique is the foundation, intensity is the tool, consistency is the superpower.",
    image: "https://images.unsplash.com/photo-1583468982228-19f19164aee2?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80",
    city: "Ankara",
    district: "Çankaya",
    gym: "Iron Republic Ankara",
    gymAddress: "Tunalı Hilmi Cd. No:78, Çankaya",
    yearsExperience: 8,
    specialties: ["Powerlifting", "Strength Coaching", "Competition Prep", "Peaking"],
    certifications: ["CSCS (NSCA)", "IPF Technical Official", "Precision Nutrition Level 1"],
    languages: ["Turkish", "English", "German"],
    rating: 4.8,
    reviewsCount: 63,
    sessionPrice: 1100,
    isOnline: true,
    isVerified: true,
    isPremium: true,
    transformations: 89,
    clientsTotal: 180,
    instagram: "@canyilmazcoach",
    weeklyAvailability: [
      { day: "Mon", slots: ["08:00", "10:00", "17:00"] },
      { day: "Wed", slots: ["08:00", "10:00", "17:00", "19:00"] },
      { day: "Fri", slots: ["08:00", "10:00", "17:00"] },
      { day: "Sat", slots: ["10:00", "12:00"] },
    ],
    testimonials: [
      { author: "Serkan T.", text: "Can got me from a 80kg to 120kg squat in 6 months. Incredible programming.", rating: 5, date: "Apr 2026" },
      { author: "Lara M.", text: "First coach who actually helped me compete. His attention to detail is unmatched.", rating: 5, date: "Mar 2026" },
      { author: "Onur A.", text: "Worth every lira. My deadlift PR went up 35kg.", rating: 4, date: "Feb 2026" },
    ],
    tags: ["#Powerlifting", "#StrengthSports", "#CompetitionPrep", "#BigLifts"],
    matchGoals: ["STRENGTH"],
  },
  {
    id: "pro-t-003",
    fullName: "Defne Akın",
    role: "TRAINER",
    headline: "HIIT, Fat Loss & Body Recomposition",
    bio: "Energetic, science-backed, and results-obsessed. I've helped 150+ clients reshape their bodies through high-intensity interval training and smart nutrition coaching. My sessions are fast, intense, and never boring. If you want results and you're ready to work — let's go.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80",
    city: "Istanbul",
    district: "Kadıköy",
    gym: "Coast Strength Kadıköy",
    gymAddress: "Moda Cd. No:17, Kadıköy",
    yearsExperience: 5,
    specialties: ["HIIT", "Fat Loss", "Body Recomposition", "Cardio Conditioning"],
    certifications: ["ACE-CPT", "HIIT Specialist (NASM)", "Les Mills BODYATTACK"],
    languages: ["Turkish", "English"],
    rating: 4.9,
    reviewsCount: 112,
    sessionPrice: 800,
    isOnline: false,
    isVerified: true,
    isPremium: false,
    transformations: 153,
    clientsTotal: 240,
    instagram: "@defneakinfit",
    weeklyAvailability: [
      { day: "Mon", slots: ["06:30", "08:00", "17:30", "19:00"] },
      { day: "Tue", slots: ["06:30", "08:00", "17:30"] },
      { day: "Thu", slots: ["06:30", "08:00", "17:30", "19:00"] },
      { day: "Fri", slots: ["06:30", "08:00"] },
      { day: "Sat", slots: ["08:00", "10:00", "12:00"] },
    ],
    testimonials: [
      { author: "Hande B.", text: "Lost 18kg with Defne. She makes every session feel exciting and possible.", rating: 5, date: "Apr 2026" },
      { author: "Tuna S.", text: "Her HIIT programs are brutal in the best way. Dropped 2 dress sizes.", rating: 5, date: "Mar 2026" },
      { author: "Zeynep A.", text: "So supportive and motivating. Never missed a Monday session!", rating: 5, date: "Jan 2026" },
    ],
    tags: ["#HIIT", "#FatLoss", "#Recomp", "#FitnessMotivation"],
    matchGoals: ["LOSE_WEIGHT", "HEALTH"],
  },
  {
    id: "pro-t-004",
    fullName: "Burak Özkan",
    role: "TRAINER",
    headline: "Bodybuilding & Aesthetic Coach",
    bio: "Former competitive bodybuilder (Men's Physique NPC). Now I help dedicated lifters sculpt competition-level physiques — without the misery of extreme dieting. My 12-week transformation program has produced 40+ stage-ready athletes. I specialize in hypertrophy science and peak week preparation.",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80",
    city: "Istanbul",
    district: "Şişli",
    gym: "UrbanFit Şişli",
    gymAddress: "Halaskargazi Cd. No:88, Şişli",
    yearsExperience: 7,
    specialties: ["Bodybuilding", "Hypertrophy", "Competition Prep", "Peak Week"],
    certifications: ["ISSA Master Trainer", "NASM-PES", "Precision Nutrition Level 2"],
    languages: ["Turkish", "English"],
    rating: 4.7,
    reviewsCount: 94,
    sessionPrice: 1200,
    isOnline: true,
    isVerified: true,
    isPremium: true,
    transformations: 201,
    clientsTotal: 310,
    instagram: "@burakozkanphysique",
    weeklyAvailability: [
      { day: "Mon", slots: ["09:00", "11:00", "14:00"] },
      { day: "Tue", slots: ["09:00", "11:00", "14:00", "16:00"] },
      { day: "Thu", slots: ["09:00", "11:00", "16:00"] },
      { day: "Sat", slots: ["10:00", "12:00"] },
    ],
    testimonials: [
      { author: "Emre C.", text: "Competed for the first time at 32 thanks to Burak. Placed top 3 in my class.", rating: 5, date: "Apr 2026" },
      { author: "Mehmet K.", text: "Transformed my physique completely. The programming is next level.", rating: 4, date: "Mar 2026" },
      { author: "Alp D.", text: "Best bodybuilding coach in Istanbul. Period.", rating: 5, date: "Feb 2026" },
    ],
    tags: ["#Bodybuilding", "#Hypertrophy", "#MensPhysique", "#AestheticFitness"],
    matchGoals: ["BUILD_MUSCLE", "STRENGTH"],
  },
  {
    id: "pro-t-005",
    fullName: "Selin Kara",
    role: "TRAINER",
    headline: "Calisthenics & Mobility Coach",
    bio: "I believe your body is the best gym. From first pull-up to human flag, I guide athletes through the full spectrum of bodyweight mastery. My mobility protocols have helped dozens of office workers recover from chronic back pain and return to sport. Movement is medicine.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=1200&q=80",
    city: "Ankara",
    district: "Keçiören",
    gym: "BodyFree Ankara Studio",
    gymAddress: "Atatürk Bulv. No:21, Keçiören",
    yearsExperience: 4,
    specialties: ["Calisthenics", "Mobility", "Flexibility", "Bodyweight Strength"],
    certifications: ["Gymnastics Bodies Foundations", "FRC Mobility Specialist", "ACE-CPT"],
    languages: ["Turkish", "English"],
    rating: 4.8,
    reviewsCount: 58,
    sessionPrice: 750,
    isOnline: true,
    isVerified: true,
    isPremium: false,
    transformations: 67,
    clientsTotal: 140,
    instagram: "@selinkara.calisthenics",
    weeklyAvailability: [
      { day: "Mon", slots: ["08:00", "10:00", "18:00"] },
      { day: "Wed", slots: ["08:00", "10:00", "18:00", "20:00"] },
      { day: "Fri", slots: ["08:00", "10:00", "18:00"] },
      { day: "Sun", slots: ["10:00", "12:00"] },
    ],
    testimonials: [
      { author: "Duygu A.", text: "Got my first muscle-up thanks to Selin! Her progressions are so logical.", rating: 5, date: "Mar 2026" },
      { author: "Arda Y.", text: "My back pain is gone after 2 months of mobility work. Life-changing.", rating: 5, date: "Feb 2026" },
      { author: "Naz T.", text: "Best calisthenics coach in Ankara. Very patient and knowledgeable.", rating: 5, date: "Jan 2026" },
    ],
    tags: ["#Calisthenics", "#Mobility", "#Handstand", "#BodyweightFit"],
    matchGoals: ["HEALTH", "STRENGTH"],
  },
  {
    id: "pro-t-006",
    fullName: "Cem Doğan",
    role: "TRAINER",
    headline: "Sports Performance & Athletic Conditioning",
    bio: "Trained athletes for national competitions in football, basketball, and track. 9 years of experience with periodization, plyometrics, and speed-agility training. If you want to move better, react faster, and outlast your competition — I'm your coach.",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=1200&q=80",
    city: "Istanbul",
    district: "Beşiktaş",
    gym: "Peak Arena Beşiktaş",
    gymAddress: "Barbaros Bulvarı No:42, Beşiktaş",
    yearsExperience: 9,
    specialties: ["Athletic Performance", "Speed & Agility", "Plyometrics", "Sport-Specific Training"],
    certifications: ["CSCS (NSCA)", "USAW Weightlifting", "NASM-PES"],
    languages: ["Turkish", "English"],
    rating: 4.8,
    reviewsCount: 71,
    sessionPrice: 1050,
    isOnline: false,
    isVerified: true,
    isPremium: true,
    transformations: 98,
    clientsTotal: 195,
    instagram: "@cemdoganperformance",
    weeklyAvailability: [
      { day: "Mon", slots: ["07:00", "09:00", "16:00", "18:00"] },
      { day: "Tue", slots: ["07:00", "09:00", "16:00"] },
      { day: "Thu", slots: ["07:00", "09:00", "16:00", "18:00"] },
      { day: "Fri", slots: ["07:00", "09:00"] },
    ],
    testimonials: [
      { author: "Taner K.", text: "Cem added 0.4s to my 40-yard dash in 8 weeks. Exceptional performance coach.", rating: 5, date: "Apr 2026" },
      { author: "Buse Y.", text: "My vertical jump went from 48cm to 61cm. Worth every penny.", rating: 5, date: "Feb 2026" },
      { author: "Mert A.", text: "Real sports science applied to training. No fluff, all results.", rating: 4, date: "Jan 2026" },
    ],
    tags: ["#SportsPerformance", "#Athletic", "#SpeedTraining", "#Plyometrics"],
    matchGoals: ["HEALTH", "STRENGTH"],
  },
  {
    id: "pro-t-007",
    fullName: "Pınar Güneş",
    role: "TRAINER",
    headline: "Rehabilitation, Pilates & Posture Correction",
    bio: "Physiotherapy-based coaching for people recovering from injuries or dealing with postural issues. I combine clinical Pilates, corrective exercise, and soft-tissue techniques to get you out of pain and back to doing what you love. Gentle methods, powerful results.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80",
    city: "Istanbul",
    district: "Bakırköy",
    gym: "Reformer Pilates Studio Bakırköy",
    gymAddress: "İstasyon Cd. No:12, Bakırköy",
    yearsExperience: 6,
    specialties: ["Rehabilitation", "Clinical Pilates", "Posture Correction", "Pre/Post Natal"],
    certifications: ["APPI Clinical Pilates", "NASM-CES", "Dry Needling Practitioner"],
    languages: ["Turkish", "English"],
    rating: 5.0,
    reviewsCount: 49,
    sessionPrice: 900,
    isOnline: true,
    isVerified: true,
    isPremium: false,
    transformations: 71,
    clientsTotal: 130,
    instagram: "@pinargunesrehab",
    weeklyAvailability: [
      { day: "Mon", slots: ["09:00", "11:00", "13:00"] },
      { day: "Tue", slots: ["09:00", "11:00", "13:00", "15:00"] },
      { day: "Wed", slots: ["09:00", "11:00"] },
      { day: "Thu", slots: ["09:00", "11:00", "13:00"] },
      { day: "Fri", slots: ["09:00", "11:00"] },
    ],
    testimonials: [
      { author: "Fatma S.", text: "After 3 years of back pain, 2 months with Pınar changed everything. I'm pain-free.", rating: 5, date: "Apr 2026" },
      { author: "Canan B.", text: "Post-pregnancy core rehab was exactly what I needed. Brilliant and caring.", rating: 5, date: "Mar 2026" },
      { author: "Sinan D.", text: "My scoliosis is manageable now. Her approach is clinical and compassionate.", rating: 5, date: "Jan 2026" },
    ],
    tags: ["#Pilates", "#Rehab", "#PostureCorrection", "#PainFree"],
    matchGoals: ["HEALTH"],
  },
  {
    id: "pro-t-008",
    fullName: "Ali Aslan",
    role: "TRAINER",
    headline: "CrossFit & Metabolic Conditioning Coach",
    bio: "Level 2 CrossFit trainer and competitive CrossFit athlete. I coach everyone from first-timers to Games-level athletes. My WODs are programmed with precision — every movement, every rest interval, every rep count has a purpose. Come in hesitant, leave unbeatable.",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80",
    city: "Ankara",
    district: "Mamak",
    gym: "CrossFit Mamak Box",
    gymAddress: "Ankara Cd. No:55, Mamak",
    yearsExperience: 5,
    specialties: ["CrossFit", "Metabolic Conditioning", "Olympic Lifting", "Endurance"],
    certifications: ["CrossFit Level 2 Trainer", "USA Weightlifting L1", "CFSC (FMS)"],
    languages: ["Turkish", "English"],
    rating: 4.7,
    reviewsCount: 76,
    sessionPrice: 850,
    isOnline: false,
    isVerified: true,
    isPremium: false,
    transformations: 108,
    clientsTotal: 220,
    instagram: "@aliaslanCF",
    weeklyAvailability: [
      { day: "Mon", slots: ["06:00", "08:00", "17:00", "19:00"] },
      { day: "Tue", slots: ["06:00", "08:00", "17:00"] },
      { day: "Wed", slots: ["06:00", "08:00", "17:00", "19:00"] },
      { day: "Thu", slots: ["06:00", "08:00", "17:00"] },
      { day: "Sat", slots: ["08:00", "10:00"] },
    ],
    testimonials: [
      { author: "Barış K.", text: "Ali turned me into a CrossFit addict. Lost 15kg and feel incredible.", rating: 5, date: "Apr 2026" },
      { author: "Ece Y.", text: "His Olympic lifting coaching is world-class. Clean technique focus.", rating: 5, date: "Mar 2026" },
      { author: "Serdar T.", text: "Best box coaching experience I've had. Every class is programmed perfectly.", rating: 4, date: "Feb 2026" },
    ],
    tags: ["#CrossFit", "#METCON", "#OlympicLifting", "#WOD"],
    matchGoals: ["LOSE_WEIGHT", "HEALTH", "STRENGTH"],
  },
];

/* ─── Dietitians ──────────────────────────────────────────── */
const DIETITIANS: Professional[] = [
  {
    id: "pro-d-001",
    fullName: "Uzm. Dyt. Irmak Kurt",
    role: "DIETITIAN",
    headline: "Sports Nutrition & Lean Muscle Diet Specialist",
    bio: "7-year registered dietitian working exclusively with active individuals and competitive athletes. I design practical, delicious meal plans — no bland chicken and rice. My clients hit their protein targets without spending 3 hours in the kitchen. Science-driven, lifestyle-first.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&q=80",
    city: "Istanbul",
    district: "Beşiktaş",
    gym: null,
    gymAddress: null,
    yearsExperience: 7,
    specialties: ["Sports Nutrition", "Lean Muscle Diet", "Meal Planning", "Supplement Guidance"],
    certifications: ["Registered Dietitian (RD)", "Sports Dietetics Certificate", "ISSN Certified"],
    languages: ["Turkish", "English"],
    rating: 4.9,
    reviewsCount: 103,
    sessionPrice: 1200,
    isOnline: true,
    isVerified: true,
    isPremium: true,
    transformations: 0,
    clientsTotal: 320,
    instagram: "@irmakkurt.dyt",
    weeklyAvailability: [
      { day: "Mon", slots: ["10:00", "12:00", "14:00"] },
      { day: "Wed", slots: ["10:00", "12:00", "14:00", "16:00"] },
      { day: "Thu", slots: ["10:00", "12:00"] },
      { day: "Fri", slots: ["10:00", "12:00", "14:00"] },
    ],
    testimonials: [
      { author: "Ece D.", text: "Irmak made my diet actually enjoyable. Hit my protein goals without hating food.", rating: 5, date: "May 2026" },
      { author: "Bora K.", text: "She simplified everything. My energy levels are through the roof.", rating: 5, date: "Apr 2026" },
      { author: "Derya Y.", text: "First dietitian who understood athlete needs. Highly recommend.", rating: 5, date: "Mar 2026" },
    ],
    tags: ["#SportsNutrition", "#MealPrep", "#ProteinFirst", "#AthleteNutrition"],
    matchGoals: ["BUILD_MUSCLE", "STRENGTH"],
  },
  {
    id: "pro-d-002",
    fullName: "Uzm. Dyt. Nida Çelik",
    role: "DIETITIAN",
    headline: "Clinical Dietitian & Weight Management Expert",
    bio: "Clinical nutrition specialist combining evidence-based protocols with realistic lifestyle habits. I work with clients managing obesity, diabetes, thyroid conditions, and metabolic disorders. My approach is compassionate, science-backed, and sustainably realistic — not a crash diet in sight.",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80",
    city: "Ankara",
    district: "Çankaya",
    gym: null,
    gymAddress: null,
    yearsExperience: 7,
    specialties: ["Clinical Dietetics", "Weight Management", "Metabolic Health", "Diabetes Nutrition"],
    certifications: ["Registered Dietitian (RD)", "Clinical Nutrition Certificate", "Motivational Interviewing Certified"],
    languages: ["Turkish", "English"],
    rating: 4.8,
    reviewsCount: 84,
    sessionPrice: 1000,
    isOnline: true,
    isVerified: true,
    isPremium: false,
    transformations: 0,
    clientsTotal: 280,
    instagram: "@nidacelikdyt",
    weeklyAvailability: [
      { day: "Mon", slots: ["09:00", "11:00", "14:00"] },
      { day: "Tue", slots: ["09:00", "11:00"] },
      { day: "Thu", slots: ["09:00", "11:00", "14:00", "16:00"] },
      { day: "Fri", slots: ["09:00", "11:00"] },
    ],
    testimonials: [
      { author: "Gülay M.", text: "Lost 22kg over 8 months sustainably. Nida's approach is completely life-friendly.", rating: 5, date: "Apr 2026" },
      { author: "Orhan S.", text: "My diabetes markers improved significantly in 3 months. Exceptional expertise.", rating: 5, date: "Mar 2026" },
      { author: "Pelin A.", text: "Finally a dietitian who doesn't make me miserable. Loving the results.", rating: 4, date: "Feb 2026" },
    ],
    tags: ["#ClinicalNutrition", "#WeightLoss", "#MetabolicHealth", "#HealthyLife"],
    matchGoals: ["LOSE_WEIGHT", "HEALTH"],
  },
  {
    id: "pro-d-003",
    fullName: "Dyt. Barış Toprak",
    role: "DIETITIAN",
    headline: "Plant-Based Nutrition & Gut Health Specialist",
    bio: "Registered dietitian passionate about the gut-brain-performance connection. I specialize in vegan and plant-forward nutrition for athletes, and help clients with IBS, food sensitivities, and digestive issues find their optimal eating pattern. Your gut is your second brain — let's optimize it.",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80",
    city: "Istanbul",
    district: "Kadıköy",
    gym: null,
    gymAddress: null,
    yearsExperience: 5,
    specialties: ["Vegan Nutrition", "Gut Health", "Plant-Based Sports", "Food Sensitivities"],
    certifications: ["Registered Dietitian (RD)", "Gut Microbiome Nutrition Certificate", "Vegan Society Accredited"],
    languages: ["Turkish", "English"],
    rating: 4.7,
    reviewsCount: 61,
    sessionPrice: 900,
    isOnline: true,
    isVerified: true,
    isPremium: false,
    transformations: 0,
    clientsTotal: 190,
    instagram: "@baristoprakdyt",
    weeklyAvailability: [
      { day: "Tue", slots: ["10:00", "12:00", "14:00"] },
      { day: "Wed", slots: ["10:00", "12:00"] },
      { day: "Thu", slots: ["10:00", "12:00", "14:00"] },
      { day: "Sat", slots: ["10:00", "12:00"] },
    ],
    testimonials: [
      { author: "Seda K.", text: "Switched to plant-based and hit all my PRs. Barış made it completely effortless.", rating: 5, date: "Apr 2026" },
      { author: "Cihan Y.", text: "My IBS is 90% better after 10 weeks. I wish I'd found him sooner.", rating: 5, date: "Mar 2026" },
      { author: "Gül B.", text: "Brilliant approach to vegan athletics. My performance hasn't suffered at all.", rating: 4, date: "Jan 2026" },
    ],
    tags: ["#PlantBased", "#GutHealth", "#VeganAthlete", "#IBSRelief"],
    matchGoals: ["HEALTH", "LOSE_WEIGHT"],
  },
  {
    id: "pro-d-004",
    fullName: "Uzm. Dyt. Ela Şahin",
    role: "DIETITIAN",
    headline: "Hormonal Balance & Women's Health Nutrition",
    bio: "Specializing in female physiology — I help women navigate nutrition through hormonal changes, PCOS, thyroid issues, fertility nutrition, and perimenopause. My programs are designed around your cycle, your life, and your goals. 6 years helping women feel powerful in their bodies.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    bannerImage: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&q=80",
    city: "Istanbul",
    district: "Nişantaşı",
    gym: null,
    gymAddress: null,
    yearsExperience: 6,
    specialties: ["Hormonal Nutrition", "Women's Health", "PCOS", "Fertility Nutrition", "Cycle Syncing"],
    certifications: ["Registered Dietitian (RD)", "Hormonal Health Nutrition Certificate", "Women's Fitness Nutrition Specialist"],
    languages: ["Turkish", "English"],
    rating: 4.9,
    reviewsCount: 77,
    sessionPrice: 1300,
    isOnline: true,
    isVerified: true,
    isPremium: true,
    transformations: 0,
    clientsTotal: 250,
    instagram: "@elasahindyt",
    weeklyAvailability: [
      { day: "Mon", slots: ["11:00", "13:00", "15:00"] },
      { day: "Wed", slots: ["11:00", "13:00", "15:00"] },
      { day: "Thu", slots: ["11:00", "13:00"] },
      { day: "Fri", slots: ["11:00", "13:00", "15:00"] },
    ],
    testimonials: [
      { author: "Aslı D.", text: "My PCOS symptoms have improved dramatically. Ela is the real deal.", rating: 5, date: "May 2026" },
      { author: "Merve T.", text: "Finally someone who understands hormonal nutrition. Life-changing guidance.", rating: 5, date: "Apr 2026" },
      { author: "Yasemin K.", text: "Ela's approach is warm, scientific, and actually works. Fully recommend.", rating: 5, date: "Feb 2026" },
    ],
    tags: ["#HormonalHealth", "#WomensNutrition", "#PCOS", "#CycleSyncing"],
    matchGoals: ["HEALTH", "LOSE_WEIGHT", "BUILD_MUSCLE"],
  },
];

export const PROFESSIONALS: Professional[] = [...TRAINERS, ...DIETITIANS];

export function getFeatured(): Professional[] {
  return PROFESSIONALS.filter((p) => p.isPremium && p.rating >= 4.8).slice(0, 3);
}

export function getByRole(role: ProfessionalRole): Professional[] {
  return PROFESSIONALS.filter((p) => p.role === role);
}

export function getOnlineAvailable(): Professional[] {
  return PROFESSIONALS.filter((p) => p.isOnline);
}

export function getTopRated(): Professional[] {
  return [...PROFESSIONALS].sort((a, b) => b.rating - a.rating).slice(0, 6);
}

/* Compatibility score 0–100 based on user goals vs professional's matchGoals */
export function getCompatibilityScore(
  userGoals: string[],
  professional: Professional,
): number {
  if (!userGoals.length) return 60; // default for unset goals
  const shared = userGoals.filter((g) => professional.matchGoals.includes(g));
  const ratio = shared.length / Math.max(userGoals.length, professional.matchGoals.length);
  return Math.round(40 + ratio * 60); // 40–100
}
