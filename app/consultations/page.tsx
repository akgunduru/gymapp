export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ConsultationsClient,
  type ConsultationListItem
} from "@/components/consultations/consultations-client";

export default async function ConsultationsPage() {
  const me = await requireUser();

  // 1. Check if the current user has a professional profile
  const professionalProfile = await db.professionalProfile.findUnique({
    where: { userId: me.id },
    select: { id: true }
  });

  let incomingRequests: ConsultationListItem[] = [];
  let outgoingRequests: ConsultationListItem[] = [];

  // 2. Fetch incoming requests if they are a professional
  if (professionalProfile) {
    const incoming = await db.consultationRequest.findMany({
      where: { professionalProfileId: professionalProfile.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        topic: true,
        message: true,
        status: true,
        createdAt: true,
        scheduledAt: true,
        completedAt: true,
        requester: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    incomingRequests = incoming.map((item) => ({
      id: item.id,
      topic: item.topic,
      message: item.message,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      scheduledAt: item.scheduledAt?.toISOString() ?? null,
      completedAt: item.completedAt?.toISOString() ?? null,
      partnerId: item.requester.id,
      partnerName: item.requester.profile?.fullName ?? item.requester.email.split("@")[0],
      partnerEmail: item.requester.email
    }));
  }

  // 3. Fetch outgoing requests (always fetch in case they are standard clients)
  const outgoing = await db.consultationRequest.findMany({
    where: { requesterId: me.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      topic: true,
      message: true,
      status: true,
      createdAt: true,
      scheduledAt: true,
      completedAt: true,
      professionalProfile: {
        select: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true
                }
              }
            }
          }
        }
      }
    }
  });

  outgoingRequests = outgoing.map((item) => ({
    id: item.id,
    topic: item.topic,
    message: item.message,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    scheduledAt: item.scheduledAt?.toISOString() ?? null,
    completedAt: item.completedAt?.toISOString() ?? null,
    partnerId: item.professionalProfile.user.id,
    partnerName: item.professionalProfile.user.profile?.fullName ?? item.professionalProfile.user.email.split("@")[0],
    partnerEmail: item.professionalProfile.user.email
  }));

  return (
    <ConsultationsClient
      role={me.role as any}
      incomingRequests={incomingRequests}
      outgoingRequests={outgoingRequests}
    />
  );
}
