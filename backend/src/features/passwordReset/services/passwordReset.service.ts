import sessionRepository from "@/features/auth/repositories/session.repository.js";
import userRepository from "@/features/auth/repositories/user.repository.js";
import * as sessionService from "@/features/auth/services/session.service.js";
import { generateRandomOTP, hashPassword, isValidEmail } from "@/utils/index.js";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import passwordResetRepository from "../repositories/passwordReset.repository.js";

export async function createPasswordResetSession(identifier: string) {
  const isEmail = isValidEmail(identifier);
  const conditions = isEmail ? { email: identifier } : { username: identifier };
  const user = await userRepository.findOne(conditions);
  if (!user) {
    return { success: false, message: "User not found.", statusCode: 404 };
  }

  const sessionToken = sessionService.generateSessionToken();
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
  const session = await passwordResetRepository.create({
    id: sessionId,
    userId: user.id,
    email: user.email,
    expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
    code: generateRandomOTP(),
    emailVerified: false,
  });

  const data = {
    email: user.email,
    token: sessionToken,
    code: session.code,
    expiresAt: session.expiresAt,
  };

  return { success: true, message: "ok", statusCode: 200, data };
}

export async function validatePasswordResetSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = await passwordResetRepository.findById(sessionId);

  if (session === null) {
    return { data: { session: null, user: null } };
  }

  const user = await userRepository.findById(session.userId);

  if (user === null) {
    await passwordResetRepository.deleteById(sessionId);
    return { data: { session: null, user: null } };
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await passwordResetRepository.deleteById(sessionId);
    return { data: { session: null, user: null } };
  }

  return { data: { session, user } };
}

export async function verifyPasswordResetSessionEmail(token: string, code: string) {
  const { data } = await validatePasswordResetSessionToken(token);

  if (!data.session) {
    return { success: false, message: "Unauthorised", statusCode: 404 };
  }

  if (data.session.emailVerified) {
    return { success: false, message: "Email already verified", statusCode: 403 };
  }

  if (code !== data.session.code) {
    return { success: false, message: "Invalid code", statusCode: 400 };
  }

  await passwordResetRepository.update({ id: data.session.id }, { emailVerified: true });

  const existingUser = await userRepository.findOne({
    id: data.session.userId,
    email: data.session.email,
  });

  if (existingUser === null) {
    return { success: false, message: "Please restart the verification process", statusCode: 400 };
  }

  await userRepository.update({ id: existingUser.id }, { emailVerified: true });

  return { success: true, message: "ok", statusCode: 200 };
}

export async function resetPassword(token: string, password: string) {
  const {
    data: { session },
  } = await validatePasswordResetSessionToken(token);

  if (!session) {
    return { success: false, message: "Unauthorised", statusCode: 404 };
  }

  if (session.emailVerified === false) {
    return { success: false, message: "Email already verified", statusCode: 403 };
  }

  await passwordResetRepository.deleteMany(session.userId);
  await sessionRepository.deleteMany({ userId: session.userId });

  const passwordHash = await hashPassword(password);
  await userRepository.update({ id: session.userId }, { passwordHash });

  const data = await sessionService.createSession(session.userId);

  return { success: true, message: "ok", statusCode: 200, data };
}
