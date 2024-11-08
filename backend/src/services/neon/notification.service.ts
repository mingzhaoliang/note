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

export async function getNotificationsByRecipientId(recipientId: string) {
  const notifications = await prisma.notification.findMany({
    where: { recipientId, sender: { deactivated: false } },
    include: { type: { select: { template: true } }, sender: true },
    orderBy: [{ seen: "asc" }, { createdAt: "desc" }],
  });

  const notificationsDto = notifications.map(createNotificationDto);

  return notificationsDto;
}

export function generateNotificationMessage(
  template: string,
  data: Record<string, string | undefined>
) {
  const message = template.replace(/{{(\w+)}}/g, (_, key) => data[key] || "");

  return message;
}

export function createNotificationDto(notification: any) {
  return {
    id: notification.id,
    sender: notification.sender,
    relatedId: notification.relatedId,
    seen: notification.seen,
    createdAt: notification.createdAt,
    notificationTypeId: notification.notificationTypeId,
    message: generateNotificationMessage(notification.type.template, {
      username: notification.sender?.username,
    }),
  };
}
