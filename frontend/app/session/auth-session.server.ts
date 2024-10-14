import envConfig from "@/config/env.config.server";
import { createCookieSessionStorage } from "@remix-run/node";

const isProduction = envConfig.NODE_ENV === "production";

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "auth",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // default session expiration time of lucia auth
    secrets: [...envConfig.COOKIE_SECRETS],
    ...(isProduction ? { domain: envConfig.DOMAIN, secure: true } : {}),
  },
});

const getAuthSession = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));

  const authSessionId = session.get("authSession");
  return authSessionId;
};

const setAuthSession = async (sessionId: string) => {
  const session = await getSession();
  session.set("authSession", sessionId);

  const header = await commitSession(session);
  return header;
};

const destroyAuthSession = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));

  const header = await destroySession(session);
  return header;
};

export { getAuthSession, setAuthSession, destroyAuthSession };
