import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessagesClient } from "@/components/messages/messages-client";
import type { Conversation } from "@/components/messages/messages-client";

export default async function MessagesPage() {
  const me = await requireUser();

  /* ── Fetch all messages involving the current user ──────── */
  const messages = await db.message.findMany({
    where: {
      OR: [{ senderId: me.id }, { receiverId: me.id }],
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      senderId: true,
      receiverId: true,
      buddyMatchId: true,
      sender: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true } },
        },
      },
      receiver: {
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  /* ── Fetch active buddy matches for messaging context ───── */
  const activeMatches = await db.buddyMatch.findMany({
    where: {
      OR: [{ userAId: me.id }, { userBId: me.id }],
      status: "ACTIVE",
    },
    select: { id: true, userAId: true, userBId: true },
  });

  const matchByPartnerId = new Map<string, string>();
  for (const match of activeMatches) {
    const partnerId = match.userAId === me.id ? match.userBId : match.userAId;
    matchByPartnerId.set(partnerId, match.id);
  }

  /* ── Group messages by conversation partner ─────────────── */
  const convMap = new Map<
    string,
    {
      partnerId: string;
      partnerName: string;
      partnerEmail: string;
      messages: Conversation["messages"];
      lastAt: Date;
    }
  >();

  for (const msg of messages) {
    const isFromMe = msg.senderId === me.id;
    const partner = isFromMe ? msg.receiver : msg.sender;
    const partnerName =
      partner.profile?.fullName ?? partner.email.split("@")[0];

    if (!convMap.has(partner.id)) {
      convMap.set(partner.id, {
        partnerId: partner.id,
        partnerName,
        partnerEmail: partner.email,
        messages: [],
        lastAt: msg.createdAt,
      });
    }

    const conv = convMap.get(partner.id)!;
    conv.messages.push({
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      isFromMe,
      buddyMatchId: msg.buddyMatchId,
    });

    if (msg.createdAt > conv.lastAt) {
      conv.lastAt = msg.createdAt;
    }
  }

  /* ── Build sorted conversation array ────────────────────── */
  const conversations: Conversation[] = Array.from(convMap.values())
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime())
    .map((conv) => ({
      partnerId: conv.partnerId,
      partnerName: conv.partnerName,
      partnerEmail: conv.partnerEmail,
      messages: conv.messages,
      lastMessageAt: conv.lastAt.toISOString(),
      matchId: matchByPartnerId.get(conv.partnerId) ?? null,
    }));

  return (
    <MessagesClient
      conversations={conversations}
      currentUserId={me.id}
    />
  );
}
