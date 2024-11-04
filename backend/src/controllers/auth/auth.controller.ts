import { createAuthSession, lucia } from "@/lib/lucia/auth.js";
import { hashPassword, verifyPassword } from "@/lib/utils/password.util.js";
import { LoginSchema } from "@/schemas/auth/login.schema.js";
import { SignupSchema } from "@/schemas/auth/signup.schema.js";
import {
  createPasswordResetToken,
  createUser,
  deletePasswordResetToken,
  findPasswordResetToken,
  findUser,
  updatePassword,
} from "@/services/neon/auth.service.js";
import { getProfile } from "@/services/neon/profile.service.js";
import { Request, Response } from "express";
import { isWithinExpirationDate } from "oslo";
import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";

const validateSession = async (req: Request, res: Response) => {
  let sessionId = req.query.sessionId as string;

  const { session, user } = await lucia.validateSession(sessionId);

  if (!session) {
    res.status(401).end();
    return;
  }

  let newSessionId = null;
  if (session.fresh) {
    await lucia.invalidateSession(sessionId);
    const newSessionCookie = lucia.createSessionCookie(session.id);

    newSessionId = newSessionCookie.value;
  }

  const profile = await getProfile({ id: user.id });

  if (!profile) {
    res.status(401).end();
    return;
  }

  const userDto = {
    ...user,
    name: profile.name,
    avatar: profile.avatar,
    private: profile.private,
  };

  res.status(200).json({ user: userDto, newSessionId });
};

const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, username, email, password } = req.body as SignupSchema;

    const userId = await createUser({ user: { fullName, username, email, password } });

    const sessionId = await createAuthSession(userId);

    res.status(200).json({ sessionId });
  } catch (error: any) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      res.status(409).json({ error: "Username or email already in use." });
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
};

const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body as LoginSchema;

  try {
    const existingUser = await findUser({ email: identifier, username: identifier });

    const validPassword = existingUser?.passwordHash
      ? await verifyPassword(existingUser.passwordHash, password)
      : await (async function () {
          await hashPassword(password);
          return false;
        })();

    if (!existingUser || !validPassword) {
      res.status(400).json({ error: "Incorrect password." });
    } else {
      const sessionId = await createAuthSession(existingUser.id);

      res.status(200).json({ sessionId });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    await lucia.invalidateSession(sessionId);
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;
    const user = await findUser({ email: identifier, username: identifier });

    if (!user) {
      res.status(400).end();
      return;
    }

    const verificationToken = await createPasswordResetToken(user.id);

    res.status(200).json({ email: user.email, verificationToken });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const verifyPasswordResetToken = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(token)));
    const storedToken = await findPasswordResetToken(tokenHash);

    if (!storedToken || !isWithinExpirationDate(storedToken.expiresAt)) {
      res.status(400).end();
      return;
    }

    await deletePasswordResetToken(tokenHash);

    const { userId } = storedToken;
    await updatePassword(userId, password);

    const sessionId = await createAuthSession(userId);

    res.status(200).json({ sessionId });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

export { login, logout, resetPassword, signup, validateSession, verifyPasswordResetToken };
