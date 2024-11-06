import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import envConfig from "./config/env.config.js";
import { startCron } from "./cron/cron.js";
import { connectDB } from "./lib/db/prisma.js";
import authRoute from "./routes/auth/auth.route.js";
import conversationRoute from "./routes/conversation/conversation.route.js";
import postRoute from "./routes/post/post.route.js";
import profileRouter from "./routes/profile/profile.route.js";
import { app, httpServer } from "./socket/socket.js";

const { PORT } = envConfig;

connectDB();

startCron();

app.use(cookieParser());

app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: 5 * 1024 * 1024, files: 9 },
    abortOnLimit: true,
    responseOnLimit: "File size limit exceeded.",
  })
);

app.use("/api/auth", authRoute);

app.use("/api/profile", profileRouter);

app.use("/api/post", postRoute);

app.use("/api/conversation", conversationRoute);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
