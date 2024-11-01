import { createConversationDto } from "@/lib/utils/createDto.js";
import { CreateConversationSchema } from "@/schemas/conversation/create-conversation.schema.js";
import { SendMessageSchema } from "@/schemas/conversation/send-message.schema.js";
import {
  createConversation,
  getConversation,
  getConversations,
  getMessages,
  sendMessage,
} from "@/services/neon/conversation.service.js";
import { Request, Response } from "express";

const getMessagesController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lastMessageId } = req.query as { lastMessageId: string | undefined };
    const { messages, remainingMessages } = await getMessages({
      conversationId: id,
      lastCursor: lastMessageId,
    });
    res.status(200).json({ messages, remaining: remainingMessages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const sendMessageController = async (req: Request, res: Response) => {
  try {
    const { id: conversationId } = req.params;
    const { senderId, text } = req.body as SendMessageSchema;
    const { message, conversation } = await sendMessage({ senderId, conversationId, text });

    res.status(201).json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getConversationController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await getConversation({ id });
    const conversationDto = createConversationDto(conversation);

    res.status(200).json({ conversation: conversationDto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getConversationsController = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.query as { profileId: string | undefined };

    if (!profileId) {
      res.status(400).json({ error: "Missing profileId." });
      return;
    }

    const conversations = await getConversations({ profileId });

    const conversationsDto = conversations.map((conversation) =>
      createConversationDto(conversation)
    );

    res.status(200).json({ conversations: conversationsDto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const createConversationController = async (req: Request, res: Response) => {
  try {
    const { senderId, recipientId } = req.body as CreateConversationSchema;
    const conversation = await createConversation({ senderId, recipientId });

    res.status(200).json({ conversationId: conversation.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export {
  createConversationController,
  getConversationController,
  getConversationsController,
  getMessagesController,
  sendMessageController,
};
