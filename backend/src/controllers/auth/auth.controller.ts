import { createAuthSession } from "@/lib/lucia/auth.js";
import { SignupSchema } from "@/schemas/auth/signup.schema.js";
import { createUser } from "@/services/db/auth.service.js";
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

export { signup };
