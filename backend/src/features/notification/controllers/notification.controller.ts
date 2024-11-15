import * as notificationService from "@/features/notification/services/notification.service.js";
import expressAsyncHandler from "express-async-handler";

export const getNotifications = expressAsyncHandler(async (req, res) => {
  const { recipientId } = req.params;
  const { last } = req.query as { last: string | undefined };
  const result = await notificationService.getNotificationsByRecipientId({ recipientId, last });

  res.status(200).json({ success: true, data: result.data, count: result.count });
});
