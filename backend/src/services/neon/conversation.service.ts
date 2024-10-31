import { prisma } from "@/lib/db/prisma.js";

const getMessages = async ({ conversationId }: { conversationId: string }) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { sender: true },
      orderBy: { createdAt: "desc" },
    });
    return messages;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get messages.");
  }
};

const sendMessage = async ({
  senderId,
  conversationId,
  text,
}: {
  senderId: string;
  conversationId: string;
  text: string;
}) => {
  try {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        text,
      },
    });

    return message;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send message.");
  }
};

const getConversation = async ({ id }: { id: string }) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { participants: { include: { profile: true } } },
    });
    return conversation;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get conversations.");
  }
};

const getConversations = async ({ profileId }: { profileId: string }) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { profileId } }, messages: { some: {} } },
      include: {
        participants: { include: { profile: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return conversations;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get conversations.");
  }
};

const createConversation = async ({
  senderId,
  recipientId,
}: {
  senderId: string;
  recipientId: string;
}) => {
  try {
    let conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: { profileId: { in: [senderId, recipientId] } },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [{ profileId: senderId }, { profileId: recipientId }],
          },
        },
      });
    }

    return conversation;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create conversation.");
  }
};

export { createConversation, getConversation, getConversations, getMessages, sendMessage };
