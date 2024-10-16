import envConfig from "@/config/env.config.js";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Prisma } from "@prisma/client";
import { Lucia } from "lucia";
import { prisma } from "../db/prisma.js";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: envConfig.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => ({
    username: attributes.username,
    email: attributes.email,
  }),
});

const createAuthSession = async (userId: string) => {
  const session = await lucia.createSession(userId, {});

  return session.id;
};

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Prisma.UserSelect;
  }
}

export { createAuthSession, lucia };
