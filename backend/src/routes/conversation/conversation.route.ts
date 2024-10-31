import {
  createConversationController,
  getConversationController,
  getConversationsController,
  getMessagesController,
  sendMessageController,
} from "@/controllers/conversation/conversation.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { createConversationSchema } from "@/schemas/conversation/create-conversation.schema.js";
import { sendMessageSchema } from "@/schemas/conversation/send-message.schema.js";
import { Router } from "express";

const router = Router();

router.get("/", getConversationsController);

router.get("/:id", getConversationController);

router.get("/:id/messages", getMessagesController);

router.post("/", validateData(createConversationSchema), createConversationController);

router.post("/:id/message", validateData(sendMessageSchema), sendMessageController);

export default router;
