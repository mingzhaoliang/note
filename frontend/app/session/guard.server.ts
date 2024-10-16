import envConfig from "@/config/env.config.server";
import { replace } from "@remix-run/node";
import { destroyAuthSession, getAuthSession, setAuthSession } from "./auth-session.server";

const requireUser = async (request: Request) => {
  const sessionId = await getAuthSession(request);
  if (!sessionId) {
    return { authHeader: null, user: null };
  }

  // Make a request to the API to validate the session.
  const query = new URLSearchParams({ sessionId });
  const response = await fetch(`${envConfig.API_URL}/auth/validate-session?${query}`);

  if (!response.ok) {
    return { authHeader: null, user: null };
  }

  // If the session is valid, return the user and the session cookie.
  const { newSessionId, user } = await response.json();
  const authHeader = newSessionId ? await setAuthSession(newSessionId) : null;

  return { authHeader, user };
};

const redirectIfAuthenticated = async (request: Request, path?: string) => {
  const { authHeader, user } = await requireUser(request);
  if (user)
    throw replace(path ?? "/", { headers: authHeader ? { "Set-Cookie": authHeader } : undefined });
};

const redirectIfUnauthenticated = async (request: Request, path?: string) => {
  const { authHeader, user } = await requireUser(request);
  if (!user)
    throw replace(path ?? "/login", {
      headers: { "Set-Cookie": await destroyAuthSession(request) },
    });

  return { authHeader, user };
};

export { redirectIfAuthenticated, redirectIfUnauthenticated, requireUser };
