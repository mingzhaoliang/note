import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";

const router = Router();

router.get("/:recipientId", notificationController.getNotifications);

export default router;
