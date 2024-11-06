import { User } from "@/services/neon/user.service.js";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { generateRandomOTP } from "../../lib/auth/utils.js";
import { prisma } from "../../lib/db/prisma.js";

export async function createPasswordResetSession(
  token: string,
  userId: string,
  email: string
): Promise<PasswordResetSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: PasswordResetSession = {
    id: sessionId,
    userId,
    email,
    expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
    code: generateRandomOTP(),
    emailVerified: false,
  };

  await prisma.passwordResetSession.create({ data: session });

  return session;
}

export async function validatePasswordResetSessionToken(
  token: string
): Promise<PasswordResetSessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await prisma.passwordResetSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (result === null) {
    return { session: null, user: null };
  }

  const { user, ...session } = result;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.passwordResetSession.delete({ where: { id: sessionId } });
    return { session: null, user: null };
  }

  return { session, user };
}

export async function setPasswordResetSessionAsEmailVerified(sessionId: string): Promise<void> {
  await prisma.passwordResetSession.update({
    where: { id: sessionId },
    data: { emailVerified: true },
  });
}

export async function invalidateUserPasswordResetSessions(userId: string): Promise<void> {
  await prisma.passwordResetSession.deleteMany({ where: { userId } });
}

export interface PasswordResetSession {
  id: string;
  userId: string;
  email: string;
  expiresAt: Date;
  code: string;
  emailVerified: boolean;
}

export type PasswordResetSessionValidationResult =
  | { session: PasswordResetSession; user: User }
  | { session: null; user: null };
