import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import envConfig from "./config/env.config.js";
import connectDB from "./lib/db/connectDB.js";
import authRoute from "./routes/auth/auth.route.js";

const { PORT } = envConfig;

connectDB();

const app = express();

app.use(cookieParser());

app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
