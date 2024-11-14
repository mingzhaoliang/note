import { ErrorResponse } from "@/middleware/errorHandler.js";
import expressAsyncHandler from "express-async-handler";
import * as passwordResetService from "../services/passwordReset.service.js";

export const createPasswordResetSession = expressAsyncHandler(async (req, res, next) => {
  const { identifier } = req.body;
  const result = await passwordResetService.createPasswordResetSession(identifier);

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});

export const validatePasswordResetSessionToken = expressAsyncHandler(async (req, res, next) => {
  const { token } = req.query;
  const result = await passwordResetService.validatePasswordResetSessionToken(token as string);

  res.status(200).json(result);
});

export const verifyPasswordResetSessionEmail = expressAsyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { code } = req.body;

  const result = await passwordResetService.verifyPasswordResetSessionEmail(token, code);

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true });
});

export const resetPassword = expressAsyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const result = await passwordResetService.resetPassword(token, password);

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});
