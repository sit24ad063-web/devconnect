import prisma from "../config/prisma";
import { emitNotification } from "../config/socket";
import type { AppNotification, NotificationType } from "@devconnect/shared";

interface CreateNotificationInput {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  message: string;
}

/**
 * Persists a notification and pushes it to the recipient in real time via
 * Socket.io (if they're connected). Used for connection requests/accepts
 * and skill endorsements per the brief's real-time requirement.
 */
export async function notify(input: CreateNotificationInput): Promise<void> {
  // Don't notify yourself (e.g. edge cases in endorsement flows).
  if (input.recipientId === input.actorId) return;

  const record = await prisma.notification.create({
    data: {
      recipientId: input.recipientId,
      actorId: input.actorId,
      type: input.type,
      message: input.message,
    },
    include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
  });

  const payload: AppNotification = {
    id: record.id,
    type: record.type as NotificationType,
    message: record.message,
    read: record.read,
    actorId: record.actorId,
    actor: record.actor,
    createdAt: record.createdAt.toISOString(),
  };

  emitNotification(input.recipientId, payload);
}
