import * as authService from "@/features/auth/services/auth.service.js";
import * as sessionService from "@/features/auth/services/session.service.js";
import { ErrorResponse } from "@/middleware/errorHandler.js";
import expressAsyncHandler from "express-async-handler";

export const validateSession = expressAsyncHandler(async (req, res, next) => {
  let sessionToken = req.query.sessionToken as string;

  const { session, user } = await sessionService.validateSessionToken(sessionToken);

  if (!session) return next(new ErrorResponse("Unauthorised", 401));

  const data = { user, sessionToken, expiresAt: session.expiresAt };

  res.status(200).json({ success: true, data });
});

export const signup = expressAsyncHandler(async (req, res, next) => {
  const { fullName, username, email, password } = req.body;

  const result = await authService.signup({ name: fullName, username, email, password });

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});

export const login = expressAsyncHandler(async (req, res, next) => {
  const result = await authService.login(req.body);

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});

export const logout = expressAsyncHandler(async (req, res, next) => {
  const { sessionToken } = req.body;
  const result = await authService.logout(sessionToken);

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true });
});

export const googleLoginRedirect = expressAsyncHandler(async (req, res) => {
  const result = await authService.googleLoginRedirect();

  res.status(200).json({ success: true, data: result.data });
});

export const googleLoginCallback = expressAsyncHandler(async (req, res, next) => {
  const { code, codeVerifier } = req.query as { code: string; codeVerifier: string };

  const result = await authService.googleLoginCallback(code, codeVerifier);

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});

export const checkUniqueUsername = expressAsyncHandler(async (req, res, next) => {
  const { username } = req.query as { username: string | undefined };

  if (!username) {
    return next(new ErrorResponse("Username is required", 400));
  }

  const result = await authService.checkUniqueUsername(username);

  res.status(200).json({ success: true, data: result.data });
});

export const checkHasPassword = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const result = await authService.checkHasPassword(id);
  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});

export const updateUsername = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { username } = req.body;
  const result = await authService.updateUsername(id, username);
  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }
  res.status(200).json({ success: true, data: result.data });
});

export const updatePassword = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  const result = await authService.updatePassword(id, currentPassword, newPassword);

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true });
});

export const deactivateUser = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const result = await authService.deactivateUser(id);

  res.status(200).json({ success: true, data: result.data });
});

export const deleteUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await authService.deactivateUser(id, true);
  res.status(200).json({ success: true, data: result.data });
});

export const reactivateUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await authService.reactivateUser(id);
  res.status(200).json({ success: true, data: result.data });
});
