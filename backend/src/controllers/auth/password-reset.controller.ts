import { ResetPasswordSchema, VerifyEmailSchema } from "@/schemas/auth/password-reset.schema.js";
import { getUserByEmailOrUsername, updatePassword } from "@/services/neon/user.service.js";
import {
  createPasswordResetSession,
  invalidateUserPasswordResetSessions,
  setPasswordResetSessionAsEmailVerified,
  validatePasswordResetSessionToken,
} from "@/services/neon/password-reset.service.js";
import {
  createSession,
  generateSessionToken,
  invalidateUserSessions,
} from "@/services/neon/session.service.js";
import { setUserAsEmailVerifiedIfEmailMatches } from "@/services/neon/user.service.js";
import { Request, Response } from "express";

export async function createPasswordResetSessionController(req: Request, res: Response) {
  try {
    const { identifier } = req.body;
    const user = await getUserByEmailOrUsername(identifier);

    if (!user) {
      res.status(400).end();
      return;
    }

    const sessionToken = generateSessionToken();
    const session = await createPasswordResetSession(sessionToken, user.id, user.email);

    res.status(200).json({
      email: user.email,
      token: sessionToken,
      code: session.code,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

export async function validatePasswordResetSessionTokenController(req: Request, res: Response) {
  try {
    const { token } = req.query as { token: string };
    const result = await validatePasswordResetSessionToken(token);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

export async function verifyPasswordResetSessionEmailController(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { code } = req.body as VerifyEmailSchema;

    const { session } = await validatePasswordResetSessionToken(token);

    if (!session) {
      res.status(401).end();
      return;
    }

    if (session.emailVerified) {
      res.status(403).end();
      return;
    }

    if (code !== session.code) {
      res.status(400).json({ message: "Invalid code" });
      return;
    }

    await setPasswordResetSessionAsEmailVerified(session.id);

    const emailMatches = await setUserAsEmailVerifiedIfEmailMatches(session.userId, session.email);
    if (!emailMatches) {
      res.status(400).json({ message: "Please restart the verification process" });
      return;
    }

    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { password } = req.body as ResetPasswordSchema;

    const { session: passwordResetSession, user } = await validatePasswordResetSessionToken(token);

    if (!passwordResetSession) {
      res.status(401).end();
      return;
    }

    if (!passwordResetSession.emailVerified) {
      res.status(403).end();
      return;
    }

    await invalidateUserPasswordResetSessions(passwordResetSession.userId);
    await invalidateUserSessions(passwordResetSession.userId);
    await updatePassword(passwordResetSession.userId, password);

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);

    res.status(200).json({ sessionToken, expiresAt: session.expiresAt });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}
