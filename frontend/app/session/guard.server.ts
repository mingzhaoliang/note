import envConfig from "@/config/env.config.server";
import { User } from "@/types";
import { replace } from "@remix-run/node";
import {
  destroyAuthSession,
  getAuthSession,
  getPasswordResetSessionToken,
  setAuthSession,
} from "./auth-session.server";

export async function requireUser(
  request: Request
): Promise<{ user: User | null; headers: Headers; authCookie: string | null }> {
  const headers = new Headers();
  const sessionToken = await getAuthSession(request);
  if (!sessionToken) {
    return { headers, user: null, authCookie: null };
  }

  // Make a request to the API to validate the session.
  const query = new URLSearchParams({ sessionToken });
  const response = await fetch(`${envConfig.API_URL}/auth/validate-session?${query}`);

  if (!response.ok) {
    return { headers, user: null, authCookie: null };
  }

  // If the session is valid, return the user and the session cookie.
  const { user, expiresAt } = await response.json();
  const authCookie = await setAuthSession(sessionToken, new Date(expiresAt));
  headers.append("Set-Cookie", authCookie);

  return { user, headers, authCookie };
}

export async function redirectIfAuthenticated(request: Request, path?: string) {
  const { user, headers } = await requireUser(request);
  if (user) throw replace(path ?? "/", { headers });
}

export async function redirectIfUnauthenticated(request: Request, path?: string) {
  const { user, headers } = await requireUser(request);
  if (!user)
    throw replace(path ?? "/login", {
      headers: { "Set-Cookie": await destroyAuthSession(request) },
    });

  return { user, headers };
}

export async function validatePasswordResetSession(request: Request) {
  const token = await getPasswordResetSessionToken(request);
  if (!token) {
    return { session: null, user: null };
  }

  const res = await fetch(
    `${envConfig.API_URL}/auth/reset-password/validate-session?token=${token}`
  );
  if (!res.ok) {
    return { session: null, user: null };
  }

  const { session, user } = await res.json();

  return { session, user };
}
