import envConfig from "@/config/env.config.server";
import { CookieSerializeOptions, createCookieSessionStorage } from "@remix-run/node";

const isProduction = envConfig.NODE_ENV === "production";

const cookieOptions: CookieSerializeOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  ...(isProduction ? { domain: envConfig.DOMAIN, secure: true } : {}),
};

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "auth",
    secrets: [...envConfig.COOKIE_SECRETS],
    ...cookieOptions,
  },
});

const getAuthSession = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));

  const authSessionId = session.get("authSession");
  return authSessionId;
};

const setAuthSession = async (token: string, expires: Date) => {
  const session = await getSession();
  session.set("authSession", token);

  const header = await commitSession(session, { ...cookieOptions, expires });
  return header;
};

const getPasswordResetSessionToken = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));

  const token = session.get("passwordResetSession") ?? null;
  return token;
};

const setPasswordResetSession = async (token: string, expires: Date) => {
  const session = await getSession();
  session.set("passwordResetSession", token);

  const cookie = await commitSession(session, { ...cookieOptions, expires });
  return cookie;
};

const destroyAuthSession = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));

  const header = await destroySession(session);
  return header;
};

export {
  destroyAuthSession,
  getAuthSession,
  getPasswordResetSessionToken,
  setAuthSession,
  setPasswordResetSession,
};
