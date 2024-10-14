import envConfig from "@/config/env.config.server";
import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";

const isProduction = envConfig.NODE_ENV === "production";

const themeSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [...envConfig.COOKIE_SECRETS],
    ...(isProduction ? { domain: envConfig.DOMAIN, secure: true } : {}),
  },
});

const themeSessionResolver = createThemeSessionResolver(themeSessionStorage);

export { themeSessionResolver };
