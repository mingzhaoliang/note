import envConfig from "@/config/env.config.server";
import { setAuthSession } from "@/session/auth-session.server";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfAuthenticated } from "@/session/guard.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfAuthenticated(request);

  const session = await getBaseSession(request.headers.get("Cookie"));
  const searchParams = new URL(request.url).searchParams;

  const state = searchParams.get("state") ?? null;
  const code = searchParams.get("code") ?? null;
  const storedState = session.get("googleOauthState") ?? null;
  const codeVerifier = session.get("googleOauthCodeVerifier") ?? null;

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return redirect("/login", { headers: { "Set-Cookie": await commitBaseSession(session) } });
  }

  const query = new URLSearchParams({ code, codeVerifier });
  const response = await fetch(`${envConfig.API_URL}/auth/login/google/callback?${query}`);

  if (!response.ok) {
    return redirect("/login", { headers: { "Set-Cookie": await commitBaseSession(session) } });
  }

  const { sessionToken, expiresAt } = await response.json();
  const authCookie = await setAuthSession(sessionToken, new Date(expiresAt));

  return redirect("/", { headers: { "Set-Cookie": authCookie } });
}
