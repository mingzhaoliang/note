import { markAsSeen } from "@/services/neon/conversation.service.js";
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

  socket.on(
    "markMessageAsSeen",
    async ({ conversationId, senderId }: { conversationId: string; senderId: string }) => {
      try {
        await markAsSeen({ conversationId });

        const socketId = getRecipientSocketId(senderId);

        socketId && io.to(socketId).emit("messageSeen", { conversationId, seenAt: new Date() });
      } catch (error) {
        console.error(error);
      }
    }
  );
});

export { app, getRecipientSocketId, httpServer, io };