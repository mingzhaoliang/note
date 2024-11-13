import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import sessionRepository from "../repositories/session.repository.js";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);

  return token;
}

export async function createSession(userId: string) {
  const sessionToken = generateSessionToken();
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));

  const session = await sessionRepository.create({
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
  });

  return { sessionToken, expiresAt: session.expiresAt };
}

export async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await sessionRepository.findByIdWithUserProfile(sessionId);

  if (result === null) {
    return { session: null, user: null };
  }

  const { user, ...session } = result;

  // Check if the session is expired
  if (Date.now() >= session.expiresAt.getTime()) {
    await sessionRepository.deleteById(sessionId);
    return { session: null, user: null };
  }
  // Extend the session if half the expiration time has passed
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await sessionRepository.update({ id: sessionId }, { expiresAt: session.expiresAt });
  }

  const userDto = {
    id: user.id,
    username: user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    deactivated: user.deactivated,
    deactivatedAt: user.deactivatedAt,
    toBeDeletedAt: user.toBeDeletedAt,
    profile: {
      name: user.profile?.name,
      avatar: user.profile?.avatar,
      bio: user.profile?.bio,
      private: user.profile?.private,
      follower: user.profile?.follower.map(({ fromId, status }) => ({
        id: fromId,
        status,
      })),
      following: user.profile?.following.map(({ toId, status }) => ({
        id: toId,
        status,
      })),
    },
  };

  return { session, user: userDto };
}
