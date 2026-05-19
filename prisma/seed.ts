import { hash } from "bcryptjs";
import {
  AnalysisStatus,
  ConsultationStatus,
  FitnessGoal,
  FitnessLevel,
  MatchRequestStatus,
  MatchStatus,
  MealSource,
  MealType,
  MuscleGroup,
  PrismaClient,
  ProfessionalType,
  UserRole,
  VerificationStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "DemoPass123!";

const ids = {
  users: {
    admin: "10000000-0000-4000-8000-000000000001",
    ece: "10000000-0000-4000-8000-000000000002",
    bora: "10000000-0000-4000-8000-000000000003",
    derya: "10000000-0000-4000-8000-000000000004",
    mert: "10000000-0000-4000-8000-000000000005",
    sena: "10000000-0000-4000-8000-000000000006",
    irmak: "10000000-0000-4000-8000-000000000007",
    arda: "10000000-0000-4000-8000-000000000008",
  },
  gyms: {
    peakArena: "20000000-0000-4000-8000-000000000001",
    urbanFit: "20000000-0000-4000-8000-000000000002",
    coastStrength: "20000000-0000-4000-8000-000000000003",
  },
  exercises: {
    benchPress: "30000000-0000-4000-8000-000000000001",
    latPulldown: "30000000-0000-4000-8000-000000000002",
    barbellSquat: "30000000-0000-4000-8000-000000000003",
    shoulderPress: "30000000-0000-4000-8000-000000000004",
    plank: "30000000-0000-4000-8000-000000000005",
    rowerIntervals: "30000000-0000-4000-8000-000000000006",
    deadlift: "30000000-0000-4000-8000-000000000007",
    dumbbellCurl: "30000000-0000-4000-8000-000000000008",
  },
  workoutPlans: {
    beginnerStrength: "40000000-0000-4000-8000-000000000001",
    intermediatePushPull: "40000000-0000-4000-8000-000000000002",
    cardioHealth: "40000000-0000-4000-8000-000000000003",
  },
  professionalProfiles: {
    mert: "50000000-0000-4000-8000-000000000001",
    sena: "50000000-0000-4000-8000-000000000002",
    irmak: "50000000-0000-4000-8000-000000000003",
    arda: "50000000-0000-4000-8000-000000000004",
  },
  matchRequests: {
    eceToBora: "60000000-0000-4000-8000-000000000001",
    deryaToEce: "60000000-0000-4000-8000-000000000002",
  },
  matches: {
    eceBora: "70000000-0000-4000-8000-000000000001",
  },
  nutritionLogs: {
    eceToday: "80000000-0000-4000-8000-000000000001",
    boraToday: "80000000-0000-4000-8000-000000000002",
  },
  mealEntries: {
    eceBreakfast: "81000000-0000-4000-8000-000000000001",
    eceLunchAi: "81000000-0000-4000-8000-000000000002",
    boraSnack: "81000000-0000-4000-8000-000000000003",
  },
  consultations: {
    eceWithDietitian: "90000000-0000-4000-8000-000000000001",
    boraWithTrainer: "90000000-0000-4000-8000-000000000002",
  },
};

async function clearDatabase() {
  await prisma.adminAction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.consultationRequest.deleteMany();
  await prisma.professionalCertificate.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.mealImageAnalysis.deleteMany();
  await prisma.mealEntry.deleteMany();
  await prisma.nutritionLog.deleteMany();
  await prisma.buddyMatch.deleteMany();
  await prisma.buddyMatchRequest.deleteMany();
  await prisma.workoutPlanExercise.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.gym.deleteMany();
  await prisma.userLocation.deleteMany();
  await prisma.fitnessPreference.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function createUsers(passwordHash: string) {
  const users = [
    {
      id: ids.users.admin,
      email: "admin@socialgym.test",
      role: UserRole.ADMIN,
      profile: {
        fullName: "Social Gym Admin",
        bio: "Demo administrator account for verification and platform review.",
        city: "Istanbul",
        district: "Kadikoy",
      },
      preference: {
        goals: [FitnessGoal.HEALTH],
        level: FitnessLevel.INTERMEDIATE,
        preferredMuscleGroups: [MuscleGroup.FULL_BODY],
        weeklyWorkoutDays: 3,
        dailyCalorieGoal: 2200,
      },
      location: {
        label: "Admin office",
        city: "Istanbul",
        district: "Kadikoy",
        latitude: 40.9919,
        longitude: 29.0278,
        isPrimary: true,
      },
    },
    {
      id: ids.users.ece,
      email: "ece.user@socialgym.test",
      role: UserRole.USER,
      profile: {
        fullName: "Ece Demir",
        bio: "Morning workouts, high-energy sessions, and consistent buddy routines.",
        city: "Istanbul",
        district: "Besiktas",
      },
      preference: {
        goals: [FitnessGoal.BUILD_MUSCLE, FitnessGoal.STRENGTH],
        level: FitnessLevel.INTERMEDIATE,
        preferredMuscleGroups: [MuscleGroup.CHEST, MuscleGroup.ARMS],
        weeklyWorkoutDays: 4,
        dailyCalorieGoal: 2300,
        dailyProteinGoal: 135,
      },
      location: {
        label: "Home",
        city: "Istanbul",
        district: "Besiktas",
        latitude: 41.0435,
        longitude: 29.0042,
        isPrimary: true,
      },
    },
    {
      id: ids.users.bora,
      email: "bora.user@socialgym.test",
      role: UserRole.USER,
      profile: {
        fullName: "Bora Kaya",
        bio: "Building a sustainable routine and looking for nearby training partners.",
        city: "Istanbul",
        district: "Sisli",
      },
      preference: {
        goals: [FitnessGoal.LOSE_WEIGHT, FitnessGoal.HEALTH],
        level: FitnessLevel.BEGINNER,
        preferredMuscleGroups: [MuscleGroup.LEGS, MuscleGroup.CARDIO],
        weeklyWorkoutDays: 3,
        dailyCalorieGoal: 2100,
        dailyProteinGoal: 115,
      },
      location: {
        label: "Home",
        city: "Istanbul",
        district: "Sisli",
        latitude: 41.0585,
        longitude: 28.9867,
        isPrimary: true,
      },
    },
    {
      id: ids.users.derya,
      email: "derya.user@socialgym.test",
      role: UserRole.USER,
      profile: {
        fullName: "Derya Yildiz",
        bio: "Advanced push/pull training and structured weekly progression.",
        city: "Istanbul",
        district: "Nisantasi",
      },
      preference: {
        goals: [FitnessGoal.STRENGTH, FitnessGoal.BUILD_MUSCLE],
        level: FitnessLevel.ADVANCED,
        preferredMuscleGroups: [MuscleGroup.BACK, MuscleGroup.SHOULDERS],
        weeklyWorkoutDays: 5,
        dailyCalorieGoal: 2450,
        dailyProteinGoal: 150,
      },
      location: {
        label: "Home",
        city: "Istanbul",
        district: "Nisantasi",
        latitude: 41.0492,
        longitude: 28.9906,
        isPrimary: true,
      },
    },
    {
      id: ids.users.mert,
      email: "mert.trainer@socialgym.test",
      role: UserRole.TRAINER,
      profile: {
        fullName: "Mert Arslan",
        bio: "Strength coach focused on safe progression and functional training.",
        city: "Istanbul",
        district: "Besiktas",
      },
      preference: {
        goals: [FitnessGoal.STRENGTH],
        level: FitnessLevel.ADVANCED,
        preferredMuscleGroups: [MuscleGroup.FULL_BODY],
        weeklyWorkoutDays: 5,
        dailyCalorieGoal: 2700,
      },
      location: {
        label: "Gym",
        city: "Istanbul",
        district: "Besiktas",
        latitude: 41.0435,
        longitude: 29.0042,
        isPrimary: true,
      },
    },
    {
      id: ids.users.sena,
      email: "sena.trainer@socialgym.test",
      role: UserRole.TRAINER,
      profile: {
        fullName: "Sena Guler",
        bio: "Posture, mobility, pilates, and beginner-friendly strength coaching.",
        city: "Istanbul",
        district: "Kadikoy",
      },
      preference: {
        goals: [FitnessGoal.HEALTH],
        level: FitnessLevel.INTERMEDIATE,
        preferredMuscleGroups: [MuscleGroup.CORE, MuscleGroup.FULL_BODY],
        weeklyWorkoutDays: 4,
        dailyCalorieGoal: 2100,
      },
      location: {
        label: "Studio",
        city: "Istanbul",
        district: "Kadikoy",
        latitude: 40.9928,
        longitude: 29.0252,
        isPrimary: true,
      },
    },
    {
      id: ids.users.irmak,
      email: "irmak.dietitian@socialgym.test",
      role: UserRole.DIETITIAN,
      profile: {
        fullName: "Uzm. Dyt. Irmak Kurt",
        bio: "Sports nutrition and practical meal planning for busy users.",
        city: "Istanbul",
        district: "Besiktas",
      },
      preference: {
        goals: [FitnessGoal.HEALTH],
        level: FitnessLevel.INTERMEDIATE,
        preferredMuscleGroups: [MuscleGroup.FULL_BODY],
        weeklyWorkoutDays: 3,
        dailyCalorieGoal: 2000,
      },
      location: {
        label: "Clinic",
        city: "Istanbul",
        district: "Besiktas",
        latitude: 41.045,
        longitude: 29.002,
        isPrimary: true,
      },
    },
    {
      id: ids.users.arda,
      email: "arda.dietitian@socialgym.test",
      role: UserRole.DIETITIAN,
      profile: {
        fullName: "Uzm. Dyt. Arda Tunc",
        bio: "Clinical nutrition, gut health, and evidence-based habit coaching.",
        city: "Ankara",
        district: "Cankaya",
      },
      preference: {
        goals: [FitnessGoal.HEALTH],
        level: FitnessLevel.BEGINNER,
        preferredMuscleGroups: [MuscleGroup.CARDIO],
        weeklyWorkoutDays: 2,
        dailyCalorieGoal: 2050,
      },
      location: {
        label: "Clinic",
        city: "Ankara",
        district: "Cankaya",
        latitude: 39.903,
        longitude: 32.8597,
        isPrimary: true,
      },
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash,
        role: user.role,
        profile: {
          create: user.profile,
        },
        fitnessPreference: {
          create: user.preference,
        },
        locations: {
          create: user.location,
        },
      },
    });
  }
}

async function createGyms() {
  await prisma.gym.createMany({
    data: [
      {
        id: ids.gyms.peakArena,
        name: "Peak Arena Besiktas",
        description: "Strength, bodybuilding, and functional training focused gym.",
        address: "Barbaros Bulvari No: 42",
        city: "Istanbul",
        district: "Besiktas",
        latitude: 41.0435,
        longitude: 29.0042,
        rating: 4.7,
        amenities: ["Free weights", "Functional area", "Personal training", "Locker room"],
        phone: "+90 212 000 00 01",
        website: "https://example.com/peak-arena",
      },
      {
        id: ids.gyms.urbanFit,
        name: "UrbanFit Sisli",
        description: "Central gym with beginner programs and cardio equipment.",
        address: "Halaskargazi Cd. No: 88",
        city: "Istanbul",
        district: "Sisli",
        latitude: 41.0585,
        longitude: 28.9867,
        rating: 4.5,
        amenities: ["Cardio zone", "Group classes", "Nutrition desk", "Showers"],
        phone: "+90 212 000 00 02",
        website: "https://example.com/urbanfit",
      },
      {
        id: ids.gyms.coastStrength,
        name: "Coast Strength Kadikoy",
        description: "Neighborhood training studio for strength and mobility.",
        address: "Moda Cd. No: 17",
        city: "Istanbul",
        district: "Kadikoy",
        latitude: 40.9919,
        longitude: 29.0278,
        rating: 4.6,
        amenities: ["Pilates studio", "Mobility area", "Small group training"],
        phone: "+90 216 000 00 03",
        website: "https://example.com/coast-strength",
      },
    ],
  });
}

async function createExercisesAndPlans() {
  await prisma.exercise.createMany({
    data: [
      {
        id: ids.exercises.benchPress,
        name: "Bench Press",
        muscleGroup: MuscleGroup.CHEST,
        level: FitnessLevel.BEGINNER,
        equipment: "Barbell",
        instructions: "Keep shoulder blades stable and lower the bar with control.",
      },
      {
        id: ids.exercises.latPulldown,
        name: "Lat Pulldown",
        muscleGroup: MuscleGroup.BACK,
        level: FitnessLevel.BEGINNER,
        equipment: "Cable machine",
        instructions: "Pull elbows down and avoid swinging the torso.",
      },
      {
        id: ids.exercises.barbellSquat,
        name: "Barbell Squat",
        muscleGroup: MuscleGroup.LEGS,
        level: FitnessLevel.INTERMEDIATE,
        equipment: "Barbell",
        instructions: "Brace the core, control depth, and keep knees tracking over toes.",
      },
      {
        id: ids.exercises.shoulderPress,
        name: "Dumbbell Shoulder Press",
        muscleGroup: MuscleGroup.SHOULDERS,
        level: FitnessLevel.INTERMEDIATE,
        equipment: "Dumbbells",
        instructions: "Press overhead without arching the lower back.",
      },
      {
        id: ids.exercises.plank,
        name: "Plank",
        muscleGroup: MuscleGroup.CORE,
        level: FitnessLevel.BEGINNER,
        equipment: "Bodyweight",
        instructions: "Keep ribs down and maintain a straight line from head to heels.",
      },
      {
        id: ids.exercises.rowerIntervals,
        name: "Rower Intervals",
        muscleGroup: MuscleGroup.CARDIO,
        level: FitnessLevel.ADVANCED,
        equipment: "Rower",
        instructions: "Alternate high-effort rows with controlled recovery.",
      },
      {
        id: ids.exercises.deadlift,
        name: "Conventional Deadlift",
        muscleGroup: MuscleGroup.FULL_BODY,
        level: FitnessLevel.ADVANCED,
        equipment: "Barbell",
        instructions: "Hinge from the hips, keep the bar close, and maintain a neutral spine.",
      },
      {
        id: ids.exercises.dumbbellCurl,
        name: "Dumbbell Curl",
        muscleGroup: MuscleGroup.ARMS,
        level: FitnessLevel.BEGINNER,
        equipment: "Dumbbells",
        instructions: "Keep elbows close to the body and avoid momentum.",
      },
    ],
  });

  await prisma.workoutPlan.create({
    data: {
      id: ids.workoutPlans.beginnerStrength,
      title: "Beginner Strength Base",
      description: "Simple full-body plan for new users building consistency.",
      level: FitnessLevel.BEGINNER,
      goal: FitnessGoal.STRENGTH,
      estimatedDurationMinutes: 45,
      createdByUserId: ids.users.admin,
      exercises: {
        create: [
          {
            order: 1,
            sets: 3,
            reps: "10",
            restSeconds: 90,
            notes: "Move slowly and prioritize form.",
            exercise: { connect: { id: ids.exercises.benchPress } },
          },
          {
            order: 2,
            sets: 3,
            reps: "12",
            restSeconds: 75,
            exercise: { connect: { id: ids.exercises.latPulldown } },
          },
          {
            order: 3,
            sets: 3,
            reps: "30 seconds",
            restSeconds: 60,
            exercise: { connect: { id: ids.exercises.plank } },
          },
        ],
      },
    },
  });

  await prisma.workoutPlan.create({
    data: {
      id: ids.workoutPlans.intermediatePushPull,
      title: "Intermediate Push Pull",
      description: "Upper-body strength plan for users with stable technique.",
      level: FitnessLevel.INTERMEDIATE,
      goal: FitnessGoal.BUILD_MUSCLE,
      estimatedDurationMinutes: 55,
      createdByUserId: ids.users.mert,
      exercises: {
        create: [
          {
            order: 1,
            sets: 4,
            reps: "8-10",
            restSeconds: 120,
            exercise: { connect: { id: ids.exercises.benchPress } },
          },
          {
            order: 2,
            sets: 4,
            reps: "8-10",
            restSeconds: 120,
            exercise: { connect: { id: ids.exercises.latPulldown } },
          },
          {
            order: 3,
            sets: 3,
            reps: "10-12",
            restSeconds: 90,
            exercise: { connect: { id: ids.exercises.shoulderPress } },
          },
          {
            order: 4,
            sets: 3,
            reps: "12",
            restSeconds: 75,
            exercise: { connect: { id: ids.exercises.dumbbellCurl } },
          },
        ],
      },
    },
  });

  await prisma.workoutPlan.create({
    data: {
      id: ids.workoutPlans.cardioHealth,
      title: "Cardio Health Intervals",
      description: "Short conditioning plan for cardiovascular health.",
      level: FitnessLevel.ADVANCED,
      goal: FitnessGoal.HEALTH,
      estimatedDurationMinutes: 30,
      createdByUserId: ids.users.sena,
      exercises: {
        create: [
          {
            order: 1,
            sets: 6,
            reps: "40 sec work / 20 sec rest",
            restSeconds: 60,
            exercise: { connect: { id: ids.exercises.rowerIntervals } },
          },
          {
            order: 2,
            sets: 3,
            reps: "45 seconds",
            restSeconds: 45,
            exercise: { connect: { id: ids.exercises.plank } },
          },
        ],
      },
    },
  });
}

async function createProfessionalProfiles() {
  await prisma.professionalProfile.create({
    data: {
      id: ids.professionalProfiles.mert,
      userId: ids.users.mert,
      type: ProfessionalType.TRAINER,
      headline: "Strength and functional training coach",
      bio: "Helps users build strength with safe progressions and measurable routines.",
      specialties: ["Strength", "Functional Training", "Bodybuilding"],
      experienceYears: 6,
      city: "Istanbul",
      district: "Besiktas",
      hourlyRate: 950,
      gymId: ids.gyms.peakArena,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date("2026-05-01T10:00:00.000Z"),
      certificates: {
        create: {
          title: "NASM Certified Personal Trainer",
          issuer: "NASM",
          filePath: "/uploads/certificates/mert-nasm-cpt.pdf",
          verificationStatus: VerificationStatus.VERIFIED,
          reviewedByAdminId: ids.users.admin,
          reviewedAt: new Date("2026-05-01T10:00:00.000Z"),
        },
      },
    },
  });

  await prisma.professionalProfile.create({
    data: {
      id: ids.professionalProfiles.sena,
      userId: ids.users.sena,
      type: ProfessionalType.TRAINER,
      headline: "Pilates, posture, and mobility coach",
      bio: "Works with beginners and office workers on posture and healthy movement.",
      specialties: ["Pilates", "Posture", "Mobility"],
      experienceYears: 4,
      city: "Istanbul",
      district: "Kadikoy",
      hourlyRate: 800,
      gymId: ids.gyms.coastStrength,
      verificationStatus: VerificationStatus.PENDING,
      certificates: {
        create: {
          title: "Balanced Body Mat Pilates",
          issuer: "Balanced Body",
          filePath: "/uploads/certificates/sena-pilates.pdf",
          verificationStatus: VerificationStatus.PENDING,
        },
      },
    },
  });

  await prisma.professionalProfile.create({
    data: {
      id: ids.professionalProfiles.irmak,
      userId: ids.users.irmak,
      type: ProfessionalType.DIETITIAN,
      headline: "Sports nutrition dietitian",
      bio: "Creates realistic nutrition plans for active users and strength athletes.",
      specialties: ["Sports Nutrition", "Weight Control", "Meal Planning"],
      experienceYears: 7,
      city: "Istanbul",
      district: "Besiktas",
      hourlyRate: 1200,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date("2026-05-02T10:00:00.000Z"),
      certificates: {
        create: {
          title: "Dietitian License",
          issuer: "Turkish Dietitians Association",
          filePath: "/uploads/certificates/irmak-dietitian-license.pdf",
          verificationStatus: VerificationStatus.VERIFIED,
          reviewedByAdminId: ids.users.admin,
          reviewedAt: new Date("2026-05-02T10:00:00.000Z"),
        },
      },
    },
  });

  await prisma.professionalProfile.create({
    data: {
      id: ids.professionalProfiles.arda,
      userId: ids.users.arda,
      type: ProfessionalType.DIETITIAN,
      headline: "Clinical nutrition and gut health specialist",
      bio: "Focuses on sustainable habits, digestion, and health-centered nutrition.",
      specialties: ["Clinical Nutrition", "Gut Health", "Habit Coaching"],
      experienceYears: 5,
      city: "Ankara",
      district: "Cankaya",
      hourlyRate: 1000,
      verificationStatus: VerificationStatus.REJECTED,
      certificates: {
        create: {
          title: "Clinical Nutrition Certificate",
          issuer: "Demo Institute",
          filePath: "/uploads/certificates/arda-clinical-nutrition.pdf",
          verificationStatus: VerificationStatus.REJECTED,
          reviewedByAdminId: ids.users.admin,
          reviewedAt: new Date("2026-05-03T10:00:00.000Z"),
          rejectionReason: "Certificate image is not readable in the demo seed.",
        },
      },
    },
  });
}

async function createSocialData() {
  await prisma.buddyMatchRequest.create({
    data: {
      id: ids.matchRequests.eceToBora,
      requesterId: ids.users.ece,
      receiverId: ids.users.bora,
      status: MatchRequestStatus.ACCEPTED,
      message: "Leg day and cardio this week?",
    },
  });

  await prisma.buddyMatchRequest.create({
    data: {
      id: ids.matchRequests.deryaToEce,
      requesterId: ids.users.derya,
      receiverId: ids.users.ece,
      status: MatchRequestStatus.PENDING,
      message: "We both train upper body. Want to compare schedules?",
    },
  });

  await prisma.buddyMatch.create({
    data: {
      id: ids.matches.eceBora,
      requestId: ids.matchRequests.eceToBora,
      userAId: ids.users.ece,
      userBId: ids.users.bora,
      status: MatchStatus.ACTIVE,
      matchedAt: new Date("2026-05-10T18:00:00.000Z"),
    },
  });
}

async function createNutritionData() {
  await prisma.nutritionLog.create({
    data: {
      id: ids.nutritionLogs.eceToday,
      userId: ids.users.ece,
      logDate: new Date("2026-05-16"),
      totalCalories: 960,
      totalProtein: 67,
      totalCarbs: 109,
      totalFat: 28,
      mealEntries: {
        create: [
          {
            id: ids.mealEntries.eceBreakfast,
            user: { connect: { id: ids.users.ece } },
            mealType: MealType.BREAKFAST,
            source: MealSource.MANUAL,
            name: "Greek yogurt with granola",
            calories: 340,
            protein: 25,
            carbs: 45,
            fat: 8,
            consumedAt: new Date("2026-05-16T06:30:00.000Z"),
          },
          {
            id: ids.mealEntries.eceLunchAi,
            user: { connect: { id: ids.users.ece } },
            mealType: MealType.LUNCH,
            source: MealSource.AI_IMAGE,
            name: "Grilled chicken bowl",
            calories: 620,
            protein: 42,
            carbs: 64,
            fat: 20,
            imagePath: "/uploads/meals/ece-chicken-bowl.jpg",
            consumedAt: new Date("2026-05-16T10:30:00.000Z"),
            imageAnalysis: {
              create: {
                status: AnalysisStatus.COMPLETED,
                imagePath: "/uploads/meals/ece-chicken-bowl.jpg",
                estimatedName: "Grilled chicken bowl",
                calories: 620,
                protein: 42,
                carbs: 64,
                fat: 20,
                confidence: 0.72,
                rawResult: {
                  analyzer: "mock",
                  version: "seed-demo",
                  note: "Demo estimate based on mocked image analysis.",
                },
                notes: "Mock AI result for Phase 2 seed data.",
              },
            },
          },
        ],
      },
    },
  });

  await prisma.nutritionLog.create({
    data: {
      id: ids.nutritionLogs.boraToday,
      userId: ids.users.bora,
      logDate: new Date("2026-05-16"),
      totalCalories: 280,
      totalProtein: 12,
      totalCarbs: 35,
      totalFat: 9,
      mealEntries: {
        create: {
          id: ids.mealEntries.boraSnack,
          user: { connect: { id: ids.users.bora } },
          mealType: MealType.SNACK,
          source: MealSource.MANUAL,
          name: "Apple and peanut butter",
          calories: 280,
          protein: 12,
          carbs: 35,
          fat: 9,
          consumedAt: new Date("2026-05-16T12:00:00.000Z"),
        },
      },
    },
  });
}

async function createConsultationsAndMessages() {
  await prisma.consultationRequest.create({
    data: {
      id: ids.consultations.eceWithDietitian,
      requesterId: ids.users.ece,
      professionalProfileId: ids.professionalProfiles.irmak,
      status: ConsultationStatus.ACCEPTED,
      topic: "Lean muscle meal plan",
      message: "I want to increase protein without making weekday meals complicated.",
      scheduledAt: new Date("2026-05-18T16:00:00.000Z"),
    },
  });

  await prisma.consultationRequest.create({
    data: {
      id: ids.consultations.boraWithTrainer,
      requesterId: ids.users.bora,
      professionalProfileId: ids.professionalProfiles.mert,
      status: ConsultationStatus.PENDING,
      topic: "Beginner strength routine",
      message: "I need a safe plan to start strength training.",
    },
  });

  await prisma.message.createMany({
    data: [
      {
        senderId: ids.users.bora,
        receiverId: ids.users.ece,
        buddyMatchId: ids.matches.eceBora,
        content: "Merhaba Ece, bu hafta UrbanFit'te kardiyo yapalim mi?",
        createdAt: new Date("2026-05-16T15:10:00.000Z"),
      },
      {
        senderId: ids.users.ece,
        receiverId: ids.users.bora,
        buddyMatchId: ids.matches.eceBora,
        content: "Olur, sali 19:00 bana uyuyor.",
        createdAt: new Date("2026-05-16T15:14:00.000Z"),
      },
      {
        senderId: ids.users.irmak,
        receiverId: ids.users.ece,
        consultationRequestId: ids.consultations.eceWithDietitian,
        content: "Protein hedefini ve gunluk rutini gorusmede netlestirelim.",
        createdAt: new Date("2026-05-16T16:20:00.000Z"),
      },
    ],
  });
}

async function createAdminActions() {
  await prisma.adminAction.createMany({
    data: [
      {
        adminId: ids.users.admin,
        action: "VERIFY_PROFESSIONAL",
        targetType: "ProfessionalProfile",
        targetId: ids.professionalProfiles.mert,
        notes: "Approved seeded trainer profile.",
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
      },
      {
        adminId: ids.users.admin,
        action: "VERIFY_PROFESSIONAL",
        targetType: "ProfessionalProfile",
        targetId: ids.professionalProfiles.irmak,
        notes: "Approved seeded dietitian profile.",
        createdAt: new Date("2026-05-02T10:00:00.000Z"),
      },
      {
        adminId: ids.users.admin,
        action: "REJECT_PROFESSIONAL",
        targetType: "ProfessionalProfile",
        targetId: ids.professionalProfiles.arda,
        notes: "Rejected seeded certificate because uploaded file is marked unreadable.",
        createdAt: new Date("2026-05-03T10:00:00.000Z"),
      },
    ],
  });
}

async function main() {
  console.log("Resetting demo database...");
  await clearDatabase();

  const passwordHash = await hash(DEMO_PASSWORD, 10);

  console.log("Creating demo users...");
  await createUsers(passwordHash);

  console.log("Creating gyms...");
  await createGyms();

  console.log("Creating exercises and workout plans...");
  await createExercisesAndPlans();

  console.log("Creating professional profiles and certificates...");
  await createProfessionalProfiles();

  console.log("Creating buddy match demo data...");
  await createSocialData();

  console.log("Creating nutrition demo data...");
  await createNutritionData();

  console.log("Creating consultations and messages...");
  await createConsultationsAndMessages();

  console.log("Creating admin action history...");
  await createAdminActions();

  console.log("Seed completed.");
  console.log(`Demo password for all seeded users: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
