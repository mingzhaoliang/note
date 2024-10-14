import envConfig from "@/config/env.config.server";
import { createCookieSessionStorage } from "@remix-run/node";

const isProduction = envConfig.NODE_ENV === "production";

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "base",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [...envConfig.COOKIE_SECRETS],
    ...(isProduction ? { domain: envConfig.DOMAIN, secure: true } : {}),
  },
});

export {
  commitSession as commitBaseSession,
  destroySession as destroyBaseSession,
  getSession as getBaseSession,
};
