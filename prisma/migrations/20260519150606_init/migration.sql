-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'TRAINER', 'DIETITIAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "FitnessGoal" AS ENUM ('LOSE_WEIGHT', 'BUILD_MUSCLE', 'STRENGTH', 'HEALTH');

-- CreateEnum
CREATE TYPE "FitnessLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "MatchRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('ACTIVE', 'ENDED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ProfessionalType" AS ENUM ('TRAINER', 'DIETITIAN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "MealSource" AS ENUM ('MANUAL', 'AI_IMAGE');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'LOW_CONFIDENCE', 'FAILED');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO', 'FULL_BODY');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "birthDate" TIMESTAMP(3),
    "city" TEXT,
    "district" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessPreference" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "goals" "FitnessGoal"[] DEFAULT ARRAY[]::"FitnessGoal"[],
    "level" "FitnessLevel" NOT NULL DEFAULT 'BEGINNER',
    "preferredMuscleGroups" "MuscleGroup"[] DEFAULT ARRAY[]::"MuscleGroup"[],
    "weeklyWorkoutDays" INTEGER NOT NULL DEFAULT 3,
    "dailyCalorieGoal" INTEGER NOT NULL DEFAULT 2200,
    "dailyProteinGoal" INTEGER NOT NULL DEFAULT 120,
    "dailyCarbGoal" INTEGER NOT NULL DEFAULT 250,
    "dailyFatGoal" INTEGER NOT NULL DEFAULT 70,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitnessPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "label" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gym" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "phone" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "level" "FitnessLevel" NOT NULL,
    "equipment" TEXT,
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" "FitnessLevel" NOT NULL,
    "goal" "FitnessGoal",
    "estimatedDurationMinutes" INTEGER NOT NULL DEFAULT 45,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlanExercise" (
    "id" UUID NOT NULL,
    "workoutPlanId" UUID NOT NULL,
    "exerciseId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "restSeconds" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlanExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuddyMatchRequest" (
    "id" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "status" "MatchRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuddyMatchRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuddyMatch" (
    "id" UUID NOT NULL,
    "requestId" UUID,
    "userAId" UUID NOT NULL,
    "userBId" UUID NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuddyMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "logDate" DATE NOT NULL,
    "totalCalories" INTEGER NOT NULL DEFAULT 0,
    "totalProtein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCarbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealEntry" (
    "id" UUID NOT NULL,
    "nutritionLogId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "mealType" "MealType" NOT NULL,
    "source" "MealSource" NOT NULL DEFAULT 'MANUAL',
    "name" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imagePath" TEXT,
    "consumedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealImageAnalysis" (
    "id" UUID NOT NULL,
    "mealEntryId" UUID NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PROCESSING',
    "imagePath" TEXT NOT NULL,
    "estimatedName" TEXT,
    "calories" INTEGER,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "rawResult" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealImageAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "ProfessionalType" NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "city" TEXT,
    "district" TEXT,
    "hourlyRate" DOUBLE PRECISION,
    "gymId" UUID,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalCertificate" (
    "id" UUID NOT NULL,
    "professionalProfileId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "filePath" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedByAdminId" UUID,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationRequest" (
    "id" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "professionalProfileId" UUID NOT NULL,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'PENDING',
    "topic" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "buddyMatchId" UUID,
    "consultationRequestId" UUID,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAction" (
    "id" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" UUID NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_userId_idx" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_city_idx" ON "UserProfile"("city");

-- CreateIndex
CREATE INDEX "UserProfile_district_idx" ON "UserProfile"("district");

-- CreateIndex
CREATE INDEX "UserProfile_city_district_idx" ON "UserProfile"("city", "district");

-- CreateIndex
CREATE INDEX "UserProfile_createdAt_idx" ON "UserProfile"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessPreference_userId_key" ON "FitnessPreference"("userId");

-- CreateIndex
CREATE INDEX "FitnessPreference_userId_idx" ON "FitnessPreference"("userId");

-- CreateIndex
CREATE INDEX "FitnessPreference_level_idx" ON "FitnessPreference"("level");

-- CreateIndex
CREATE INDEX "FitnessPreference_createdAt_idx" ON "FitnessPreference"("createdAt");

-- CreateIndex
CREATE INDEX "UserLocation_userId_idx" ON "UserLocation"("userId");

-- CreateIndex
CREATE INDEX "UserLocation_city_idx" ON "UserLocation"("city");

-- CreateIndex
CREATE INDEX "UserLocation_district_idx" ON "UserLocation"("district");

-- CreateIndex
CREATE INDEX "UserLocation_city_district_idx" ON "UserLocation"("city", "district");

-- CreateIndex
CREATE INDEX "UserLocation_createdAt_idx" ON "UserLocation"("createdAt");

-- CreateIndex
CREATE INDEX "Gym_city_idx" ON "Gym"("city");

-- CreateIndex
CREATE INDEX "Gym_district_idx" ON "Gym"("district");

-- CreateIndex
CREATE INDEX "Gym_city_district_idx" ON "Gym"("city", "district");

-- CreateIndex
CREATE INDEX "Gym_createdAt_idx" ON "Gym"("createdAt");

-- CreateIndex
CREATE INDEX "Exercise_muscleGroup_idx" ON "Exercise"("muscleGroup");

-- CreateIndex
CREATE INDEX "Exercise_level_idx" ON "Exercise"("level");

-- CreateIndex
CREATE INDEX "Exercise_muscleGroup_level_idx" ON "Exercise"("muscleGroup", "level");

-- CreateIndex
CREATE INDEX "Exercise_createdAt_idx" ON "Exercise"("createdAt");

-- CreateIndex
CREATE INDEX "WorkoutPlan_createdByUserId_idx" ON "WorkoutPlan"("createdByUserId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_level_idx" ON "WorkoutPlan"("level");

-- CreateIndex
CREATE INDEX "WorkoutPlan_goal_idx" ON "WorkoutPlan"("goal");

-- CreateIndex
CREATE INDEX "WorkoutPlan_createdAt_idx" ON "WorkoutPlan"("createdAt");

-- CreateIndex
CREATE INDEX "WorkoutPlanExercise_workoutPlanId_idx" ON "WorkoutPlanExercise"("workoutPlanId");

-- CreateIndex
CREATE INDEX "WorkoutPlanExercise_exerciseId_idx" ON "WorkoutPlanExercise"("exerciseId");

-- CreateIndex
CREATE INDEX "WorkoutPlanExercise_createdAt_idx" ON "WorkoutPlanExercise"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPlanExercise_workoutPlanId_order_key" ON "WorkoutPlanExercise"("workoutPlanId", "order");

-- CreateIndex
CREATE INDEX "BuddyMatchRequest_requesterId_idx" ON "BuddyMatchRequest"("requesterId");

-- CreateIndex
CREATE INDEX "BuddyMatchRequest_receiverId_idx" ON "BuddyMatchRequest"("receiverId");

-- CreateIndex
CREATE INDEX "BuddyMatchRequest_status_idx" ON "BuddyMatchRequest"("status");

-- CreateIndex
CREATE INDEX "BuddyMatchRequest_createdAt_idx" ON "BuddyMatchRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BuddyMatchRequest_requesterId_receiverId_key" ON "BuddyMatchRequest"("requesterId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "BuddyMatch_requestId_key" ON "BuddyMatch"("requestId");

-- CreateIndex
CREATE INDEX "BuddyMatch_userAId_idx" ON "BuddyMatch"("userAId");

-- CreateIndex
CREATE INDEX "BuddyMatch_userBId_idx" ON "BuddyMatch"("userBId");

-- CreateIndex
CREATE INDEX "BuddyMatch_status_idx" ON "BuddyMatch"("status");

-- CreateIndex
CREATE INDEX "BuddyMatch_createdAt_idx" ON "BuddyMatch"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BuddyMatch_userAId_userBId_key" ON "BuddyMatch"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "NutritionLog_userId_idx" ON "NutritionLog"("userId");

-- CreateIndex
CREATE INDEX "NutritionLog_logDate_idx" ON "NutritionLog"("logDate");

-- CreateIndex
CREATE INDEX "NutritionLog_createdAt_idx" ON "NutritionLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionLog_userId_logDate_key" ON "NutritionLog"("userId", "logDate");

-- CreateIndex
CREATE INDEX "MealEntry_nutritionLogId_idx" ON "MealEntry"("nutritionLogId");

-- CreateIndex
CREATE INDEX "MealEntry_userId_idx" ON "MealEntry"("userId");

-- CreateIndex
CREATE INDEX "MealEntry_mealType_idx" ON "MealEntry"("mealType");

-- CreateIndex
CREATE INDEX "MealEntry_source_idx" ON "MealEntry"("source");

-- CreateIndex
CREATE INDEX "MealEntry_createdAt_idx" ON "MealEntry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MealImageAnalysis_mealEntryId_key" ON "MealImageAnalysis"("mealEntryId");

-- CreateIndex
CREATE INDEX "MealImageAnalysis_status_idx" ON "MealImageAnalysis"("status");

-- CreateIndex
CREATE INDEX "MealImageAnalysis_createdAt_idx" ON "MealImageAnalysis"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalProfile_userId_key" ON "ProfessionalProfile"("userId");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_userId_idx" ON "ProfessionalProfile"("userId");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_type_idx" ON "ProfessionalProfile"("type");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_verificationStatus_idx" ON "ProfessionalProfile"("verificationStatus");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_type_verificationStatus_idx" ON "ProfessionalProfile"("type", "verificationStatus");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_city_idx" ON "ProfessionalProfile"("city");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_district_idx" ON "ProfessionalProfile"("district");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_city_district_idx" ON "ProfessionalProfile"("city", "district");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_createdAt_idx" ON "ProfessionalProfile"("createdAt");

-- CreateIndex
CREATE INDEX "ProfessionalCertificate_professionalProfileId_idx" ON "ProfessionalCertificate"("professionalProfileId");

-- CreateIndex
CREATE INDEX "ProfessionalCertificate_reviewedByAdminId_idx" ON "ProfessionalCertificate"("reviewedByAdminId");

-- CreateIndex
CREATE INDEX "ProfessionalCertificate_verificationStatus_idx" ON "ProfessionalCertificate"("verificationStatus");

-- CreateIndex
CREATE INDEX "ProfessionalCertificate_createdAt_idx" ON "ProfessionalCertificate"("createdAt");

-- CreateIndex
CREATE INDEX "ConsultationRequest_requesterId_idx" ON "ConsultationRequest"("requesterId");

-- CreateIndex
CREATE INDEX "ConsultationRequest_professionalProfileId_idx" ON "ConsultationRequest"("professionalProfileId");

-- CreateIndex
CREATE INDEX "ConsultationRequest_status_idx" ON "ConsultationRequest"("status");

-- CreateIndex
CREATE INDEX "ConsultationRequest_createdAt_idx" ON "ConsultationRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");

-- CreateIndex
CREATE INDEX "Message_buddyMatchId_idx" ON "Message"("buddyMatchId");

-- CreateIndex
CREATE INDEX "Message_consultationRequestId_idx" ON "Message"("consultationRequestId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAction_adminId_idx" ON "AdminAction"("adminId");

-- CreateIndex
CREATE INDEX "AdminAction_action_idx" ON "AdminAction"("action");

-- CreateIndex
CREATE INDEX "AdminAction_targetType_targetId_idx" ON "AdminAction"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AdminAction_createdAt_idx" ON "AdminAction"("createdAt");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessPreference" ADD CONSTRAINT "FitnessPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyMatchRequest" ADD CONSTRAINT "BuddyMatchRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyMatchRequest" ADD CONSTRAINT "BuddyMatchRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyMatch" ADD CONSTRAINT "BuddyMatch_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BuddyMatchRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyMatch" ADD CONSTRAINT "BuddyMatch_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyMatch" ADD CONSTRAINT "BuddyMatch_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionLog" ADD CONSTRAINT "NutritionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealEntry" ADD CONSTRAINT "MealEntry_nutritionLogId_fkey" FOREIGN KEY ("nutritionLogId") REFERENCES "NutritionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealEntry" ADD CONSTRAINT "MealEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealImageAnalysis" ADD CONSTRAINT "MealImageAnalysis_mealEntryId_fkey" FOREIGN KEY ("mealEntryId") REFERENCES "MealEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalProfile" ADD CONSTRAINT "ProfessionalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalProfile" ADD CONSTRAINT "ProfessionalProfile_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalCertificate" ADD CONSTRAINT "ProfessionalCertificate_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalCertificate" ADD CONSTRAINT "ProfessionalCertificate_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationRequest" ADD CONSTRAINT "ConsultationRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationRequest" ADD CONSTRAINT "ConsultationRequest_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_buddyMatchId_fkey" FOREIGN KEY ("buddyMatchId") REFERENCES "BuddyMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_consultationRequestId_fkey" FOREIGN KEY ("consultationRequestId") REFERENCES "ConsultationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
