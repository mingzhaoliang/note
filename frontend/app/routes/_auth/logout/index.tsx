import envConfig from "@/config/env.config.server";
import { destroyAuthSession, getAuthSession } from "@/session/auth-session.server";
import { ActionFunctionArgs, redirect } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const sessionId = await getAuthSession(request);

  if (!sessionId) {
    return redirect("/", { status: 401 });
  }

  const response = await fetch(`${envConfig.API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    return redirect("/", {
      status: 500,
      headers: { "Set-Cookie": await destroyAuthSession(request) },
    });
  }

  return redirect("/", { headers: { "Set-Cookie": await destroyAuthSession(request) } });
}