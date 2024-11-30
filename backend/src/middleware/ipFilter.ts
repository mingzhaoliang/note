import envConfig from "@/config/env.config.js";
import expressAsyncHandler from "express-async-handler";
import { ErrorResponse } from "./errorHandler.js";

const ipFilter = expressAsyncHandler(async (req, res, next) => {
  if (req.path === "/health") {
    return next();
  }

  const clientIP = req.ip || req.socket.remoteAddress;

  if (
    envConfig.NODE_ENV === "production" &&
    (!clientIP || !envConfig.ALLOWED_IPS.includes(clientIP))
  ) {
    return next(new ErrorResponse("Forbidden", 403));
  }

  next();
});

export default ipFilter;
