import { createAuthSession } from "@/lib/lucia/auth.js";
import { google } from "@/lib/lucia/providers/google.js";
import { createUser, findAccount } from "@/services/neon/auth.service.js";
import { generateCodeVerifier, generateState, OAuth2RequestError } from "arctic";
import { Request, Response } from "express";
import { alphabet, generateRandomString } from "oslo/crypto";

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
    const sessionId = await createAuthSession(userId);

    // Pass the session cookie
    res.status(200).json({ sessionId });
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

const getUserId = async (user: any) => {
  const existingAccount = await findAccount({
    providerId: "google",
    providerUserId: user.sub,
  });

  let userId;

  if (!existingAccount) {
    const fullName = generateRandomString(10, alphabet("A-Z", "a-z", "0-9"));
    userId = await createUser({
      user: {
        fullName,
        username: user.name,
        email: user.email,
      },
      account: {
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
