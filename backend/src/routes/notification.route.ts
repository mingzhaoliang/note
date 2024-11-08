import { getNotificationsController } from "@/controllers/notification/notification.controller.js";
import { Router } from "express";

const router = Router();

router.get("/:recipientId", getNotificationsController);

export default router;
