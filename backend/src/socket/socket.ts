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

});

export { app, getRecipientSocketId, httpServer, io };
