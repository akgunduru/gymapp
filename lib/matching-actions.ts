"use server";

import { revalidatePath } from "next/cache";
import { MatchRequestStatus, MatchStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export type MatchActionResult = {
  success: boolean;
  error?: string;
};

/* ─── Send buddy request ─────────────────────────────────── */
export async function sendMatchRequestAction(
  receiverId: string,
  message?: string,
): Promise<MatchActionResult> {
  const me = await requireUser();

  if (receiverId === me.id) {
    return { success: false, error: "Cannot send a request to yourself." };
  }

  try {
    const receiver = await db.user.findFirst({
      where: {
        id: receiverId,
        isActive: true,
        role: "USER",
      },
      select: { id: true },
    });

    if (!receiver) {
      return { success: false, error: "Member not found." };
    }

    const existingMatch = await db.buddyMatch.findFirst({
      where: {
        status: MatchStatus.ACTIVE,
        OR: [
          { userAId: me.id, userBId: receiverId },
          { userAId: receiverId, userBId: me.id },
        ],
      },
      select: { id: true },
    });

    if (existingMatch) {
      return { success: false, error: "You are already matched with this member." };
    }

    const openRequest = await db.buddyMatchRequest.findFirst({
      where: {
        status: { in: [MatchRequestStatus.PENDING, MatchRequestStatus.ACCEPTED] },
        OR: [
          { requesterId: me.id, receiverId },
          { requesterId: receiverId, receiverId: me.id },
        ],
      },
      select: {
        id: true,
        requesterId: true,
        status: true,
      },
    });

    if (openRequest?.status === MatchRequestStatus.PENDING) {
      if (openRequest.requesterId === me.id) {
        return { success: false, error: "Request already sent." };
      }

      return {
        success: false,
        error: "This member already sent you a request. Accept it from Pending requests.",
      };
    }

    if (openRequest?.status === MatchRequestStatus.ACCEPTED) {
      return { success: false, error: "This request has already been accepted." };
    }

    const previousRequest = await db.buddyMatchRequest.findUnique({
      where: {
        requesterId_receiverId: {
          requesterId: me.id,
          receiverId,
        },
      },
      select: { id: true, status: true },
    });

    if (
      previousRequest &&
      (previousRequest.status === MatchRequestStatus.REJECTED ||
        previousRequest.status === MatchRequestStatus.CANCELLED)
    ) {
      await db.buddyMatchRequest.update({
        where: { id: previousRequest.id },
        data: {
          status: MatchRequestStatus.PENDING,
          message: message?.trim() || null,
        },
      });

      revalidatePath("/matches");
      return { success: true };
    }

    await db.buddyMatchRequest.create({
      data: {
        requesterId: me.id,
        receiverId,
        status: MatchRequestStatus.PENDING,
        message: message?.trim() || null,
      },
    });

    revalidatePath("/matches");
    return { success: true };
  } catch (err: unknown) {
    // P2002 = unique constraint violation (request already sent)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { success: false, error: "Request already sent." };
    }
    console.error("[matching-actions] sendMatchRequestAction:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/* ─── Accept a received buddy request ───────────────────── */
export async function acceptMatchRequestAction(
  requestId: string,
): Promise<MatchActionResult> {
  const me = await requireUser();

  const request = await db.buddyMatchRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    return { success: false, error: "Request not found." };
  }
  if (request.receiverId !== me.id) {
    return { success: false, error: "You cannot accept this request." };
  }
  if (request.status !== MatchRequestStatus.PENDING) {
    return { success: false, error: "Request is no longer pending." };
  }

  try {
    // Ensure deterministic order for the unique(userAId, userBId) constraint
    const [userAId, userBId] =
      request.requesterId < me.id
        ? [request.requesterId, me.id]
        : [me.id, request.requesterId];

    await db.$transaction(async (tx) => {
      await tx.buddyMatchRequest.update({
        where: { id: requestId },
        data: { status: MatchRequestStatus.ACCEPTED },
      });

      await tx.buddyMatch.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        update: { status: MatchStatus.ACTIVE },
        create: {
          requestId,
          userAId,
          userBId,
          status: MatchStatus.ACTIVE,
        },
      });
    });

    revalidatePath("/matches");
    revalidatePath("/messages");
    return { success: true };
  } catch (err) {
    console.error("[matching-actions] acceptMatchRequestAction:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/* ─── Send a message ─────────────────────────────────────── */
export async function sendMessageAction(
  receiverId: string,
  content: string,
  buddyMatchId?: string,
): Promise<MatchActionResult> {
  const me = await requireUser();

  if (receiverId === me.id) {
    return { success: false, error: "Cannot message yourself." };
  }
  if (!content.trim()) {
    return { success: false, error: "Message cannot be empty." };
  }

  try {
    // 1. Check for active buddy match
    const activeMatch = buddyMatchId
      ? await db.buddyMatch.findFirst({
          where: {
            id: buddyMatchId,
            status: MatchStatus.ACTIVE,
            OR: [
              { userAId: me.id, userBId: receiverId },
              { userAId: receiverId, userBId: me.id },
            ],
          },
          select: { id: true },
        })
      : await db.buddyMatch.findFirst({
          where: {
            status: MatchStatus.ACTIVE,
            OR: [
              { userAId: me.id, userBId: receiverId },
              { userAId: receiverId, userBId: me.id },
            ],
          },
          select: { id: true },
        });

    if (activeMatch) {
      await db.message.create({
        data: {
          senderId: me.id,
          receiverId,
          content: content.trim(),
          buddyMatchId: activeMatch.id,
        },
      });

      revalidatePath("/messages");
      revalidatePath("/matches");
      return { success: true };
    }

    // 2. Fallback: Check for active accepted consultation request
    const activeConsultation = await db.consultationRequest.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          {
            requesterId: me.id,
            professionalProfile: {
              userId: receiverId,
            },
          },
          {
            requesterId: receiverId,
            professionalProfile: {
              userId: me.id,
            },
          },
        ],
      },
      select: { id: true },
    });

    if (activeConsultation) {
      await db.message.create({
        data: {
          senderId: me.id,
          receiverId,
          content: content.trim(),
          consultationRequestId: activeConsultation.id,
        },
      });

      revalidatePath("/messages");
      revalidatePath("/consultations");
      return { success: true };
    }

    return { success: false, error: "You can message active buddy matches or active consultations only." };
  } catch (err) {
    console.error("[matching-actions] sendMessageAction:", err);
    return { success: false, error: "Failed to send message. Please try again." };
  }
}
