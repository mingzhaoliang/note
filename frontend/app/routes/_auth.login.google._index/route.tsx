import envConfig from "@/config/env.config.server";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfAuthenticated } from "@/session/guard.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfAuthenticated(request);

  const session = await getBaseSession(request.headers.get("Cookie"));

  const response = await fetch(envConfig.API_URL + "/auth/login/google");
  const { googleOauthState, googleOauthCodeVerifier, googleOauthUrl } = await response.json();

  session.flash("googleOauthState", googleOauthState);
  session.flash("googleOauthCodeVerifier", googleOauthCodeVerifier);

  return redirect(googleOauthUrl, { headers: { "Set-Cookie": await commitBaseSession(session) } });
}
