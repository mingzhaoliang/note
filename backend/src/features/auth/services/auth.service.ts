import { google } from "@/features/auth/oauth.js";
import profileRepository from "@/features/profile/repositories/profile.repository.js";
import { hashPassword, isValidEmail, verifyPassword } from "@/utils/index.js";
import { generateRandomString, RandomReader } from "@oslojs/crypto/random";
import { generateCodeVerifier, generateState } from "arctic";
import accountRepository from "../repositories/account.repository.js";
import sessionRepository from "../repositories/session.repository.js";
import userRepository from "../repositories/user.repository.js";
import { createSession, validateSessionToken } from "./session.service.js";

const random: RandomReader = {
  read(bytes) {
    crypto.getRandomValues(bytes);
  },
};

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export async function signup(body: {
  username: string;
  email: string;
  password: string;
  name: string;
}) {
  const { username, email, password, name } = body;
  const existingUser = await userRepository.findOne({ email });

  // Check if the user already exists
  if (existingUser) {
    return { success: false, message: "User already exists", statusCode: 400 };
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepository.create({ email, username, passwordHash });

  await profileRepository.create({ id: user.id, name, username });

  const data = await createSession(user.id);

  return { success: true, data, message: "ok", statusCode: 200 };
}

export async function login(body: { identifier: string; password: string }) {
  const { identifier, password } = body;

  const isEmail = isValidEmail(identifier);
  const conditions = isEmail ? { email: identifier } : { username: identifier };
  const user = await userRepository.findOneWithPassword(conditions);

  if (user === null) {
    await hashPassword(password);
    return { success: false, message: "User not found.", statusCode: 404 };
  }

  if (user.passwordHash === null) {
    return { success: false, message: "User not found.", statusCode: 404 };
  }

  const isValidPassword = await verifyPassword(user.passwordHash, password);
  if (!isValidPassword) {
    return { success: false, message: "Invalid password.", statusCode: 400 };
  }

  const data = await createSession(user.id);

  return { success: true, data, message: "ok", statusCode: 200 };
}

export async function logout(token: string) {
  const { session } = await validateSessionToken(token);
  if (session === null) {
    return { success: false, message: "Unauthorised", statusCode: 400 };
  }

  sessionRepository.deleteById(session.id);

  return { success: true, message: "ok", statusCode: 200 };
}

export async function googleLoginRedirect() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const scopes = ["email", "profile"];
  const url = await google.createAuthorizationURL(state, codeVerifier, { scopes });

  return {
    success: true,
    data: {
      googleOauthState: state,
      googleOauthCodeVerifier: codeVerifier,
      googleOauthUrl: url.toString(),
    },
    message: "ok",
    statusCode: 200,
  };
}

export async function googleLoginCallback(code: string, codeVerifier: string) {
  const tokens = await google.validateAuthorizationCode(code, codeVerifier).catch(() => {
    return null;
  });
  if (tokens === null) {
    return { success: false, message: "Invalid code.", statusCode: 400 };
  }
  const accessToken = tokens.accessToken;

  // Fetch the user's information
  const googleUser = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((res) => res.json());

  const existingAccount = await accountRepository.findById("google", googleUser.sub);

  let userId;

  if (existingAccount) {
    userId = existingAccount.userId;
  } else {
    const username = generateRandomString(random, alphabet, 16);
    const user = await userRepository.create({ email: googleUser.email, username });

    await profileRepository.create({ id: user.id, name: googleUser.name, username });
    await accountRepository.create({
      providerId: "google",
      providerUserId: googleUser.sub,
      userId: user.id,
    });

    userId = user.id;
  }

  const data = await createSession(userId);

  return { success: true, data, message: "ok", statusCode: 200 };
}

export async function checkUniqueUsername(username: string) {
  const user = await userRepository.findOne({ username });
  const isValid = user === null;

  return { success: true, data: isValid };
}

export async function checkHasPassword(id: string) {
  const user = await userRepository.findByIdWithPassword(id);
  if (!user) {
    return { success: false, message: "User not found.", statusCode: 404 };
  }

  const data = user.passwordHash !== null;

  return { success: true, message: "ok", statusCode: 200, data };
}

export async function updateUsername(id: string, username: string) {
  const existingUser = await userRepository.findOne({ username });

  if (existingUser) {
    return { success: false, message: "Username already exists", statusCode: 400 };
  }
  const data = await userRepository.update({ id }, { username });
  await profileRepository.update({ id }, { username });

  return { success: true, data, message: "ok", statusCode: 200 };
}

export async function updatePassword(id: string, currentPassword: string, newPassword: string) {
  const user = await userRepository.findByIdWithPassword(id);

  if (!user || user.passwordHash === null) {
    return { success: false, message: "Unauthorised", statusCode: 404 };
  }

  const isValidPassword = await verifyPassword(user.passwordHash, currentPassword);

  if (!isValidPassword) {
    return { success: false, message: "Invalid password.", statusCode: 400 };
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepository.update({ id }, { passwordHash });

  return { success: true, message: "ok", statusCode: 200 };
}

export async function deactivateUser(id: string, isDelete?: boolean) {
  const deactivatedAt = new Date();
  // Set the user to be deleted in 30 days if delete is true
  const toBeDeletedAt = isDelete ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) : undefined;
  const data = await userRepository.update(
    { id },
    { deactivated: true, deactivatedAt, toBeDeletedAt }
  );

  return { success: true, data };
}

export async function reactivateUser(id: string) {
  const data = await userRepository.update(
    { id },
    {
      deactivated: false,
      deactivatedAt: null,
      toBeDeletedAt: null,
    }
  );

  return { success: true, data };
}

export async function removeDeletedUsers() {
  await userRepository.deleteToBeDeleted();
}
