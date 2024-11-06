import { hashPassword, verifyPassword } from "@/lib/auth/utils.js";
import { LoginSchema } from "@/schemas/auth/login.schema.js";
import { SignupSchema } from "@/schemas/auth/signup.schema.js";
import { UpdatePasswordSchema } from "@/schemas/auth/update-password.schema.js";
import { getProfile } from "@/services/neon/profile.service.js";
import {
  createSession,
  generateSessionToken,
  invalidateSession,
  validateSessionToken,
} from "@/services/neon/session.service.js";
import {
  createUser,
  deactivateUser,
  getUserByEmailOrUsername,
  getUserById,
  reactivateUser,
  updatePassword,
} from "@/services/neon/user.service.js";
import { Request, Response } from "express";

const validateSession = async (req: Request, res: Response) => {
  try {
    let sessionToken = req.query.sessionToken as string;

    const { session, user } = await validateSessionToken(sessionToken);

    if (!session) {
      res.status(401).end();
      return;
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
      bio: profile.bio,
      private: profile.private,
      follower: profile.follower.map(({ fromId: id, status }) => ({ id, status })),
      following: profile.following.map(({ toId: id, status }) => ({ id, status })),
    };

    res.status(200).json({ user: userDto, sessionToken, expiresAt: session.expiresAt });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, username, email, password } = req.body as SignupSchema;

    const userId = await createUser({ userData: { fullName, username, email, password } });

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId);

    res.status(200).json({ sessionToken, expiresAt: session.expiresAt });
  } catch (error: any) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      res.status(409).json({ error: "Username or email already in use." });
    } else {
      res.status(500).end();
    }
  }
};

const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body as LoginSchema;

  try {
    const existingUser = await getUserByEmailOrUsername(identifier);

    const validPassword = existingUser?.passwordHash
      ? await verifyPassword(existingUser.passwordHash, password)
      : await (async function () {
          await hashPassword(password);
          return false;
        })();

    if (!existingUser || !validPassword) {
      res.status(400).json({ error: "Incorrect password." });
    } else {
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, existingUser.id);

      res.status(200).json({ sessionToken, expiresAt: session.expiresAt });
    }
  } catch (error) {
    res.status(500).end();
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const { sessionToken } = req.body;
    const { session } = await validateSessionToken(sessionToken);
    if (!session) {
      res.status(401).end();
      return;
    }
    invalidateSession(session.id);
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const updatePasswordController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body as UpdatePasswordSchema;

    const user = await getUserById(id);

    if (!user || !user.passwordHash) {
      res.status(400).json({ error: "Unable to update password." });
      return;
    }

    const validPassword = await verifyPassword(user.passwordHash, currentPassword);

    if (!validPassword) {
      res.status(400).json({ error: "Incorrect password." });
      return;
    }

    await updatePassword(id, newPassword);

    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const updatePasswordAvailabilityCheck = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    // User has an account but has no password
    const available = !!(user && user.passwordHash);
    res.status(200).json({ available });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const deactivateUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await deactivateUser(id);
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await deactivateUser(id, true);
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const reactivateUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await reactivateUser(id);
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

export {
  deactivateUserController,
  deleteUserController,
  login,
  logout,
  reactivateUserController,
  signup,
  updatePasswordAvailabilityCheck,
  updatePasswordController,
  validateSession,
};
