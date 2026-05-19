"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { FitnessLevel, ProfessionalType, UserRole } from "@prisma/client";
import { createSession, destroySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginSchema, registerSchema } from "@/lib/validators";
import type { UserRole as AppUserRole } from "@/lib/constants";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
  });

  if (!parsed.success) {
    redirectWithError("/login", "Please enter a valid email and password.");
  }

  const user = await db.user.findUnique({
    where: {
      email: parsed.data.email.toLowerCase(),
    },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
    },
  });

  if (!user?.isActive) {
    redirectWithError("/login", "Invalid email or password.");
  }

  const passwordMatches = await compare(parsed.data.password, user.passwordHash);

  if (!passwordMatches) {
    redirectWithError("/login", "Invalid email or password.");
  }

  await createSession({
    id: user.id,
    email: user.email,
    role: user.role as AppUserRole,
  });

  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    fullName: getStringValue(formData, "fullName"),
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
    role: getStringValue(formData, "role"),
  });

  if (!parsed.success) {
    redirectWithError("/register", "Please complete all required fields.");
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    redirectWithError("/register", "An account with this email already exists.");
  }

  const passwordHash = await hash(parsed.data.password, 10);
  const role = parsed.data.role as UserRole;

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      role,
      profile: {
        create: {
          fullName: parsed.data.fullName,
        },
      },
      fitnessPreference: {
        create: {
          level: FitnessLevel.BEGINNER,
          weeklyWorkoutDays: 3,
        },
      },
      professionalProfile:
        role === UserRole.TRAINER || role === UserRole.DIETITIAN
          ? {
              create: {
                type:
                  role === UserRole.TRAINER
                    ? ProfessionalType.TRAINER
                    : ProfessionalType.DIETITIAN,
                headline: "New professional profile",
              },
            }
          : undefined,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  await createSession({
    id: user.id,
    email: user.email,
    role: user.role as AppUserRole,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
