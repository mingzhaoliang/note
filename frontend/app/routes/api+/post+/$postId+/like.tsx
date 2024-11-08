import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request, params }: ActionFunctionArgs) {
  const { user, headers } = await redirectIfUnauthenticated(request);

  const { postId } = params;

  const response = await fetch(`${envConfig.API_URL}/post/${postId}/like`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId: user.id }),
  });

  let message, post;
  if (!response.ok) {
    message = response.status === 400 ? (await response.json()).message : response.statusText;
  } else {
    post = (await response.json()).post;
  }

  const actionState = { message, postId };

  return json({ post, actionState }, { headers });
}
