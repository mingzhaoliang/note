import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request, params }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const { postId } = params;

  const response = await fetch(`${envConfig.API_URL}/post/${postId}/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId: user.id }),
  });

  let message;
  if (!response.ok) {
    const error: string = (await response.json()).error;
    message = response ? error : "Oops! Something went wrong!";
  }

  const actionState = { message, postId };

  return json({ actionState }, { headers });
}