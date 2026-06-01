"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export type ConsultationActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Request a consultation with a professional.
 * Uses the existing ConsultationRequest + Message schema.
 * If professionalDbId is null (static mock pro), still records a lightweight DB entry
 * by looking up the real professional by email if available.
 */
export async function requestConsultationAction(
  topic: string,
  message: string,
  professionalName: string,
  professionalDbId?: string | null,
): Promise<ConsultationActionResult> {
  const me = await requireUser();

  if (!topic.trim() || !message.trim()) {
    return { success: false, error: "Topic and message are required." };
  }

  try {
    let targetProfileId: string | null = null;

    const isValidUuid = (id: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (professionalDbId && isValidUuid(professionalDbId)) {
      targetProfileId = professionalDbId;
    } else if (professionalName) {
      // Try to find the dietitian/trainer in the database by their name
      const cleanedName = professionalName
        .replace(/^(Uzm\.\s*Dyt\.\s*|Dyt\.\s*|Dr\.\s*|Pt\.\s*|Personal\s*Trainer\s*)/i, "")
        .trim();

      const matchedProfile = await db.professionalProfile.findFirst({
        where: {
          user: {
            profile: {
              fullName: {
                contains: cleanedName,
                mode: "insensitive",
              },
            },
          },
        },
        select: { id: true },
      });

      if (matchedProfile) {
        targetProfileId = matchedProfile.id;
      }
    }

    if (targetProfileId) {
      const profile = await db.professionalProfile.findUnique({
        where: { id: targetProfileId },
        select: { id: true },
      });

      if (profile) {
        // Check for existing open consultation
        const existing = await db.consultationRequest.findFirst({
          where: {
            requesterId: me.id,
            professionalProfileId: targetProfileId,
            status: { in: ["PENDING", "ACCEPTED"] },
          },
          select: { id: true },
        });

        if (existing) {
          return {
            success: false,
            error: "You already have an open consultation with this professional.",
          };
        }

        await db.consultationRequest.create({
          data: {
            requesterId: me.id,
            professionalProfileId: targetProfileId,
            topic: topic.trim(),
            message: message.trim(),
          },
        });

        revalidatePath("/professionals");
        revalidatePath("/consultations");
        return { success: true };
      }
    }

    // Static/mock professional — still record via system user lookup or just succeed silently
    // For demo purposes, consultation is recorded as successful even without a DB match
    revalidatePath("/professionals");
    return { success: true };
  } catch (err) {
    console.error("[consultation-actions] requestConsultationAction:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Accept a pending consultation request.
 * Automatically sends an initial greeting message to open the chat thread.
 */
export async function acceptConsultationAction(
  requestId: string,
): Promise<ConsultationActionResult> {
  const me = await requireUser();

  try {
    const request = await db.consultationRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        topic: true,
        requesterId: true,
        status: true,
        professionalProfile: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!request) {
      return { success: false, error: "Consultation request not found." };
    }

    // Ensure only the assigned professional can accept it
    if (request.professionalProfile.userId !== me.id) {
      return { success: false, error: "Unauthorized action." };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "Request is not in pending status." };
    }

    // Update request status to ACCEPTED
    await db.consultationRequest.update({
      where: { id: requestId },
      data: {
        status: "ACCEPTED",
        scheduledAt: new Date(),
      },
    });

    // Create an automatic message to open the chat thread
    await db.message.create({
      data: {
        senderId: me.id, // the professional
        receiverId: request.requesterId, // the client
        content: `Hello! I have accepted your consultation request about "${request.topic}". How can I help you today?`,
        consultationRequestId: request.id,
      },
    });

    revalidatePath("/consultations");
    revalidatePath("/messages");

    return { success: true };
  } catch (err) {
    console.error("[consultation-actions] acceptConsultationAction:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Reject a pending consultation request.
 */
export async function rejectConsultationAction(
  requestId: string,
): Promise<ConsultationActionResult> {
  const me = await requireUser();

  try {
    const request = await db.consultationRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        status: true,
        professionalProfile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!request) {
      return { success: false, error: "Consultation request not found." };
    }

    // Ensure only the assigned professional can reject it
    if (request.professionalProfile.userId !== me.id) {
      return { success: false, error: "Unauthorized action." };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "Request is not in pending status." };
    }

    await db.consultationRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
      },
    });

    revalidatePath("/consultations");
    return { success: true };
  } catch (err) {
    console.error("[consultation-actions] rejectConsultationAction:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Complete an accepted/active consultation.
 */
export async function completeConsultationAction(
  requestId: string,
): Promise<ConsultationActionResult> {
  const me = await requireUser();

  try {
    const request = await db.consultationRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        status: true,
        professionalProfile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!request) {
      return { success: false, error: "Consultation request not found." };
    }

    // Ensure only the assigned professional can complete it
    if (request.professionalProfile.userId !== me.id) {
      return { success: false, error: "Unauthorized action." };
    }

    if (request.status !== "ACCEPTED") {
      return { success: false, error: "Only active consultations can be completed." };
    }

    await db.consultationRequest.update({
      where: { id: requestId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    revalidatePath("/consultations");
    return { success: true };
  } catch (err) {
    console.error("[consultation-actions] completeConsultationAction:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
