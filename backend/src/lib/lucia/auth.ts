import envConfig from "@/config/env.config.js";
import { UserDoc } from "@/models/user.model.js";
import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
import { Lucia } from "lucia";
import mongoose from "mongoose";

const adapter = new MongodbAdapter(
  mongoose.connection.collection("sessions"),
  mongoose.connection.collection("users")
);

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
  await lucia.invalidateUserSessions(userId);
  const session = await lucia.createSession(userId, {});

  return session.id;
};

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<UserDoc, "_id">;
  }
}

export { createAuthSession, lucia };
