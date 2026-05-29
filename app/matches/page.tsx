import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateBuddyScore } from "@/lib/buddy-score";
import { MatchesClient } from "@/components/matches/matches-client";
import type { BuddyProfile, BuddyRequestStatus } from "@/components/matches/matches-client";

export default async function MatchesPage() {
  const me = await requireUser();

  /* ── Fetch my own fitness data for scoring ──────────────── */
  const myData = await db.user.findUnique({
    where: { id: me.id },
    select: {
      profile: {
        select: { city: true, district: true },
      },
      fitnessPreference: {
        select: {
          level: true,
          goals: true,
          preferredMuscleGroups: true,
          weeklyWorkoutDays: true,
        },
      },
      locations: {
        where: { isPrimary: true },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          latitude: true,
          longitude: true,
          city: true,
          district: true,
        },
      },
    },
  });

  /* ── Fetch all other active users ───────────────────────── */
  const users = await db.user.findMany({
    where: {
      id: { not: me.id },
      isActive: true,
      role: "USER",
    },
    select: {
      id: true,
      email: true,
      role: true,
      profile: {
        select: {
          fullName: true,
          bio: true,
          city: true,
          district: true,
        },
      },
      fitnessPreference: {
        select: {
          level: true,
          goals: true,
          preferredMuscleGroups: true,
          weeklyWorkoutDays: true,
        },
      },
      locations: {
        where: { isPrimary: true },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          latitude: true,
          longitude: true,
          city: true,
          district: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  /* ── Fetch existing match relationships ─────────────────── */
  const [sentRequests, receivedRequests, activeMatches] = await Promise.all([
    db.buddyMatchRequest.findMany({
      where: { requesterId: me.id },
      select: { id: true, receiverId: true, status: true },
    }),
    db.buddyMatchRequest.findMany({
      where: { receiverId: me.id },
      select: { id: true, requesterId: true, status: true },
    }),
    db.buddyMatch.findMany({
      where: {
        OR: [{ userAId: me.id }, { userBId: me.id }],
        status: "ACTIVE",
      },
      select: { id: true, userAId: true, userBId: true },
    }),
  ]);

  /* ── Build fast-lookup maps ──────────────────────────────── */
  const sentMap = new Map(sentRequests.map((r) => [r.receiverId, r]));
  const receivedMap = new Map(receivedRequests.map((r) => [r.requesterId, r]));

  const matchedUserIds = new Map<string, string>();
  for (const match of activeMatches) {
    const partnerId = match.userAId === me.id ? match.userBId : match.userAId;
    matchedUserIds.set(partnerId, match.id);
  }

  /* ── Calculate scores and build BuddyProfile list ──────── */
  const myPref = myData?.fitnessPreference;
  const myPrimaryLocation = myData?.locations[0] ?? null;
  const myCity = myPrimaryLocation?.city ?? myData?.profile?.city ?? null;
  const myDistrict = myPrimaryLocation?.district ?? myData?.profile?.district ?? null;
  const myLocation = myPrimaryLocation
    ? {
        latitude: myPrimaryLocation.latitude,
        longitude: myPrimaryLocation.longitude,
      }
    : null;

  const buddies: BuddyProfile[] = users.map((user) => {
    const theirPref = user.fitnessPreference;
    const theirPrimaryLocation = user.locations[0] ?? null;
    const theirCity = theirPrimaryLocation?.city ?? user.profile?.city ?? null;
    const theirDistrict = theirPrimaryLocation?.district ?? user.profile?.district ?? null;
    const theirLocation = theirPrimaryLocation
      ? {
          latitude: theirPrimaryLocation.latitude,
          longitude: theirPrimaryLocation.longitude,
        }
      : null;

    const { score, reasons, distanceKm } =
      myPref && theirPref
        ? calculateBuddyScore({
            myLevel: myPref.level,
            myGoals: myPref.goals,
            myMuscleGroups: myPref.preferredMuscleGroups,
            myCity,
            myDistrict,
            myLocation,
            myWeeklyDays: myPref.weeklyWorkoutDays,
            theirLevel: theirPref.level,
            theirGoals: theirPref.goals,
            theirMuscleGroups: theirPref.preferredMuscleGroups,
            theirCity,
            theirDistrict,
            theirLocation,
            theirWeeklyDays: theirPref.weeklyWorkoutDays,
          })
        : {
            score: 0,
            reasons: ["Complete your profile to see a score"],
            distanceKm: null,
          };

    let requestStatus: BuddyRequestStatus = { type: "none" };
    const matchId = matchedUserIds.get(user.id);

    if (matchId) {
      requestStatus = { type: "matched", matchId };
    } else {
      const sent = sentMap.get(user.id);
      const received = receivedMap.get(user.id);
      if (sent) {
        requestStatus = { type: "sent", requestId: sent.id, status: sent.status as string };
      } else if (received) {
        requestStatus = { type: "received", requestId: received.id, status: received.status as string };
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as string,
      fullName: user.profile?.fullName ?? null,
      bio: user.profile?.bio ?? null,
      city: theirCity,
      district: theirDistrict,
      level: theirPref?.level ?? null,
      goals: theirPref?.goals.map((g) => g as string) ?? [],
      muscleGroups: theirPref?.preferredMuscleGroups.map((m) => m as string) ?? [],
      weeklyWorkoutDays: theirPref?.weeklyWorkoutDays ?? 0,
      score,
      reasons,
      distanceKm,
      requestStatus,
      matchId: matchId ?? null,
    };
  });

  // Matched first, then sorted by score
  buddies.sort((a, b) => {
    const aMatched = a.requestStatus.type === "matched" ? 1 : 0;
    const bMatched = b.requestStatus.type === "matched" ? 1 : 0;
    if (bMatched !== aMatched) return bMatched - aMatched;
    return b.score - a.score;
  });

  return <MatchesClient buddies={buddies} currentUserId={me.id} />;
}
