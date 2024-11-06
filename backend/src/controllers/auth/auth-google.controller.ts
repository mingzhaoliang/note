import { google } from "@/lib/auth/oauth.js";
import { createSession, generateSessionToken } from "@/services/neon/session.service.js";
import { createUser, getAccount } from "@/services/neon/user.service.js";
import type { RandomReader } from "@oslojs/crypto/random";
import { generateRandomString } from "@oslojs/crypto/random";
import { generateCodeVerifier, generateState, OAuth2RequestError } from "arctic";
import { Request, Response } from "express";

const googleLogin = async (req: Request, res: Response) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const scopes = ["email", "profile"];
  const url = await google.createAuthorizationURL(state, codeVerifier, { scopes });

  res.status(200).json({
    googleOauthState: state,
    googleOauthCodeVerifier: codeVerifier,
    googleOauthUrl: url.toString(),
  });
};

const googleLoginCallback = async (req: Request, res: Response) => {
  // Validate the authorisation code
  try {
    const { code, codeVerifier } = req.query as { code: string; codeVerifier: string };

    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken;

    // Fetch the user's information
    const user = await getGoogleUser(accessToken);

    const userId = await getUserId(user);
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId);

    // Pass the session token to the frontend
    res.status(200).json({ sessionToken, expiresAt: session.expiresAt });
  } catch (error) {
    console.error(error);

    if (error instanceof OAuth2RequestError) {
      // Invalid authorisation code
      res.status(400).end();
    } else {
      // Internal server error
      res.status(500).end();
    }
  }
};

const getGoogleUser = async (accessToken: string) => {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await response.json();
};

const random: RandomReader = {
  read(bytes) {
    crypto.getRandomValues(bytes);
  },
};
const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const getUserId = async (user: any) => {
  const existingAccount = await getAccount({
    providerId: "google",
    providerUserId: user.sub,
  });

  let userId;

  if (!existingAccount) {
    const username = generateRandomString(random, alphabet, 16);
    userId = await createUser({
      userData: {
        fullName: user.name,
        username,
        email: user.email,
      },
      accountData: {
        providerId: "google",
        providerUserId: user.sub,
      },
    });
  } else {
    userId = existingAccount.userId;
  }

  return userId;
};

export { googleLogin, googleLoginCallback };
