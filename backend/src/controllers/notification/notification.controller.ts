import { getNotificationsByRecipientId } from "@/services/neon/notification.service.js";
import { Request, Response } from "express";

export async function getNotificationsController(req: Request, res: Response) {
  try {
    const { recipientId } = req.params;
    const notifications = await getNotificationsByRecipientId(recipientId);

    res.status(200).json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}
