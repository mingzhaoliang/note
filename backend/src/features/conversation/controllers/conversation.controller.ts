import * as conversationService from "@/features/conversation/services/conversation.service.js";
import { ErrorResponse } from "@/middleware/errorHandler.js";
import expressAsyncHandler from "express-async-handler";

export const getConversationMessages = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { last } = req.query as { last: string | undefined };
  const result = await conversationService.getConversationMessages({
    conversationId: id,
    last,
  });

  res.status(200).json({ success: true, data: result.data, count: result.count });
});

export const sendMessage = expressAsyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  const { senderId, text } = req.body;
  const result = await conversationService.sendMessage({
    senderId,
    conversationId,
    text,
  });

  res.status(201).json({ success: true, data: result.data });
});

export const getConversations = expressAsyncHandler(async (req, res, next) => {
  const { profileId } = req.query as { profileId: string | undefined };

  if (!profileId) {
    return next(new ErrorResponse("Missing profileId", 400));
  }

  const result = await conversationService.getConversations({ profileId });

  res.status(200).json({ success: true, data: result.data, count: result.count });
});

export const createConversation = expressAsyncHandler(async (req, res) => {
  const { senderId, recipientId } = req.body;
  const conversation = await conversationService.createConversation({ senderId, recipientId });

  res.status(200).json({ conversationId: conversation.id });
});
