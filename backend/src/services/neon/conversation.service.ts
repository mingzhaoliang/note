import { prisma } from "@/lib/db/prisma.js";

const getMessages = async ({
  conversationId,
  lastCursor,
  take = 50,
}: {
  conversationId: string;
  lastCursor?: string;
  take?: number;
}) => {
  try {
    const messagesPromise = prisma.message.findMany({
      where: { conversationId },
      take,
      ...(lastCursor && { skip: 1, cursor: { id: lastCursor } }),
      include: { sender: true },
      orderBy: { createdAt: "desc" },
    });

    const remainingMessagesPromise = prisma.message
      .findMany({
        where: { conversationId },
        ...(lastCursor && { skip: take + 1, cursor: { id: lastCursor } }),
        orderBy: { createdAt: "desc" },
      })
      .then((messages) => messages.length);

    const [messages, remainingMessages] = await Promise.all([
      messagesPromise,
      remainingMessagesPromise,
    ]);

    return { messages, remainingMessages };
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
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        text,
      },
      include: { sender: true },
    });

    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
      },
      include: { participants: { select: { profileId: true } } },
    });

    return { message, conversation };
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

const markAsSeen = async ({ conversationId }: { conversationId: string }) => {
  try {
    const messages = await prisma.message.updateMany({
      where: { conversationId, seen: false },
      data: { seen: true, seenAt: new Date() },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to mark as seen.");
  }
};

export {
  createConversation,
  getConversation,
  getConversations,
  getMessages,
  markAsSeen,
  sendMessage,
};
