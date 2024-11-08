import { prisma } from "@/lib/db/prisma.js";

export async function sendNotification(
  notificationTypeId: number,
  senderId: string,
  recipientId: string,
  relatedId?: string
) {
  const notification = await prisma.notification.create({
    data: {
      notificationTypeId,
      senderId,
      recipientId,
      relatedId: relatedId ?? null,
    },
  });

  return notification;
}

export async function deleteNotifications(
  notificationTypeId: number,
  senderId: string,
  recipientId: string
) {
  await prisma.notification.deleteMany({
    where: {
      notificationTypeId,
      senderId,
      recipientId,
    },
  });
}

