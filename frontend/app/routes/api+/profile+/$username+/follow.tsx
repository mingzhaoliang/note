import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request, params }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const { username } = params;

  const response = await fetch(`${envConfig.API_URL}/profile/${username}/follow`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId: user.id }),
  });

  if (!response.ok) {
    return json(
      { actionState: { message: (await response.json()).error } },
      { status: 400, headers }
    );
  }

  return json(null, { headers });
}
