import * as conversationController from "@/features/conversation/controllers/conversation.controller.js";
import {
  createConversationSchema,
  sendMessageSchema,
} from "@/features/conversation/validation/conversation.validation.js";
import { validateData } from "@/middleware/validation.js";
import { Router } from "express";

const router = Router();

router.get("/", conversationController.getConversations);
router.get("/:id", conversationController.getConversationMessages);
router.post("/", validateData(createConversationSchema), conversationController.createConversation);
router.post("/:id/message", validateData(sendMessageSchema), conversationController.sendMessage);

export default router;
