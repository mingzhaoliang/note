import compression from "compression";
import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import PrettyError from "pretty-error";
import envConfig from "./config/env.config.js";
import { startCron } from "./cron/cron.js";
import { errorHandler } from "./middleware/errorHandler.js";
import ipFilter from "./middleware/ipFilter.js";
import { prisma } from "./prisma/client.js";
import route from "./routes/index.js";
import { app, httpServer } from "./socket/socket.js";

const { PORT } = envConfig;

// * Security, Compression & Parser
const pe = new PrettyError();
pe.start();
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// * File Upload
app.use(
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: 5 * 1024 * 1024, files: 9 },
    abortOnLimit: true,
    responseOnLimit: "File size limit exceeded.",
  })
);

// * IP Filter
app.set("trust proxy", true);
app.use(ipFilter);

// * Route
app.get("/health", (_, res) => {
  res.status(200).send("OK");
});
app.use(route);

// * Custom Error Handler
app.use(errorHandler);

// * DB
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// * Cron Job
startCron();

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
