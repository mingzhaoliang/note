import notificationRepository from "../repositories/notification.repository.js";

function generateNotificationMessage(template: string, data: Record<string, string | undefined>) {
  const message = template.replace(/{{(\w+)}}/g, (_, key) => data[key] || "");

  return message;
}

export function createNotificationDto(row: any) {
  const dto: Record<string, any> = {};
  Object.entries(row).forEach(([key, value]) => {
    if (key !== "type") {
      dto[key] = value;
    }
  });

  const message = generateNotificationMessage(row.type.template, {
    username: row.sender?.username,
  });
  dto.message = message;

  return dto;
}

export async function sendNotification(
  notificationTypeId: number,
  senderId: string,
  recipientId: string,
  relatedId?: string
) {
  const notification = await notificationRepository.create({
    notificationTypeId,
    senderId,
    recipientId,
    relatedId: relatedId ?? null,
  });

  return notification;
}

export async function deleteNotifications(
  notificationTypeId: number,
  senderId: string,
  recipientId: string
) {
  await notificationRepository.deleteMany({
    notificationTypeId,
    senderId,
    recipientId,
    relatedId: null,
  });
}

export async function getNotificationsByRecipientId(body: { recipientId: string; last?: string }) {
  const { recipientId, last } = body;
  const { rows, count } = await notificationRepository.findMany(
    { recipientId },
    { limit: 10, cursorId: last, orderBy: [{ seen: "asc" }, { createdAt: "desc" }] }
  );

  const rowsDto = rows.map(createNotificationDto);

  return { success: true, data: rowsDto, count };
}

export async function markNotificationsAsSeen(body: { recipientId: string }) {
  const { recipientId } = body;
  const data = await notificationRepository.updateMany(
    { recipientId, seen: false },
    { seen: true }
  );

  return { success: true, data };
}
