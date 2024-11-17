import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request, params }: ActionFunctionArgs) {
  const { user, headers } = await redirectIfUnauthenticated(request);

  const { postId } = params;

  const response = await fetch(`${envConfig.API_URL}/post/${postId}/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId: user.id }),
  });

  let message;
  const data = await response.json();
  if (!response.ok) {
    message = data.message ?? response.statusText;
  }

  const actionState = { message, postId };

  return json({ actionState }, { headers });
}
