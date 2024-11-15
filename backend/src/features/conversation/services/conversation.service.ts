import profileRepository from "@/features/profile/repositories/profile.repository.js";
import { getRecipientSocketId, io } from "@/socket/socket.js";
import conversationRepository from "../repositories/conversation.repository.js";
import messageRepository from "../repositories/message.repository.js";

export async function getConversationMessages({
  conversationId,
  last,
}: {
  conversationId: string;
  last?: string;
}) {
  const conversation = await conversationRepository.findById(conversationId);
  if (conversation === null) {
    return { success: false, message: "Conversation not found", statusCode: 404 };
  }

  const { rows: messages, count } = await messageRepository.findMany(
    { conversationId },
    {
      limit: 20,
      cursorId: last,
      orderBy: { createdAt: "desc" },
    }
  );

  const conversationDto = {
    ...conversation,
    participants: conversation.participants.map(({ profile }) => profile),
  };

  return { success: true, data: { conversation: conversationDto, messages }, count };
}

export async function sendMessage({
  senderId,
  conversationId,
  text,
}: {
  senderId: string;
  conversationId: string;
  text: string;
}) {
  const _message = await messageRepository.create({
    conversationId,
    senderId,
    text,
  });
  const sender = await profileRepository.findById(senderId);
  const message = { ..._message, sender };

  const conversation = await conversationRepository.update(
    { id: conversationId },
    { updatedAt: new Date() }
  );

  const recipientSocketIds = conversation.participants
    .filter((participant) => participant.profileId !== senderId)
    .map((participant) => getRecipientSocketId(participant.profileId));

  recipientSocketIds.forEach((socketId) => {
    if (!socketId) return;
    io.to(socketId).emit("newMessage", message);
  });

  return { success: true, data: message };
}

export async function getConversations({ profileId }: { profileId: string }) {
  const { rows, count } = await conversationRepository.findMany(
    { profileId },
    { orderBy: { updatedAt: "desc" } }
  );

  const rowsDto = rows
    .filter((row) => row.messages.length > 0)
    .map((row) => ({
      id: row.id,
      participants: row.participants.map(({ profile }) => profile),
      lastMessage: row.messages?.[0] || null,
    }));

  return { success: true, data: rowsDto, count };
}

export async function createConversation({
  senderId,
  recipientId,
}: {
  senderId: string;
  recipientId: string;
}) {
  let conversation = await conversationRepository.findOneByParticipants([senderId, recipientId]);

  if (!conversation) {
    conversation = await conversationRepository.create([senderId, recipientId]);
  }

  return conversation;
}

export async function markAsSeen({ conversationId }: { conversationId: string }) {
  const now = new Date();
  const data = await messageRepository.updateMany(
    { conversationId, seen: false },
    { seen: true, seenAt: now }
  );

  return { success: true, data };
}
