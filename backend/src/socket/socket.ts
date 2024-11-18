import { markAsSeen } from "@/features/conversation/services/conversation.service.js";
import { markNotificationsAsSeen } from "@/features/notification/services/notification.service.js";
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer);

const userSocketMap = new Map<string, string>();

const getRecipientSocketId = (recipientId: string) => {
  return userSocketMap.get(recipientId);
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId as string | undefined;

  if (userId) userSocketMap.set(userId, socket.id);

  socket.on("markMessageAsSeen", async ({ conversationId, senderId, recipientId }) => {
    try {
      await markAsSeen({ conversationId });

      const socketIds = [getRecipientSocketId(senderId), getRecipientSocketId(recipientId)];

      socketIds.forEach((socketId) => {
        socketId && io.to(socketId).emit("messageSeen", { conversationId, seenAt: new Date() });
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("notification:mark-as-seen", ({ userId }) => {
    markNotificationsAsSeen({ recipientId: userId });
  });
});

export { app, getRecipientSocketId, httpServer, io };
