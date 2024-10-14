import { createAuthSession } from "@/lib/lucia/auth.js";
import { hashPassword, verifyPassword } from "@/lib/utils/password.util.js";
import { LoginSchema } from "@/schemas/auth/login.schema.js";
import { SignupSchema } from "@/schemas/auth/signup.schema.js";
import { createUser, findUser } from "@/services/db/auth.service.js";
import { Request, Response } from "express";
import { startSession } from "mongoose";

const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, username, email, password } = req.body as SignupSchema;

    const session = await startSession();
    session.startTransaction();

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
    const existingUser = await findUser({
      $or: [{ email: identifier }, { username: identifier }],
    });

    const validPassword = existingUser?.passwordHash
      ? await verifyPassword(existingUser.passwordHash, password)
      : await (async function () {
          await hashPassword(password);
          return false;
        })();

    if (!existingUser || !validPassword) {
      res.status(400).json({ error: "Incorrect password." });
    } else {
      const sessionId = await createAuthSession(existingUser._id);

      res.status(200).json({ sessionId });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export { signup, login };
