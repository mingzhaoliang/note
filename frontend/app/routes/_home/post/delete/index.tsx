import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const formData = await request.formData();
  const _action = formData.get("_action");
  const postId = formData.get("postId");

  const response = await fetch(`${envConfig.API_URL}/post/delete/${postId}`, { method: "DELETE" });

  let message;
  if (!response.ok) {
    const error: string = (await response.json()).error;
    message = response ? error : "Oops! Something went wrong!";
  }

  const actionState = { message, _action, postId };

  return json({ actionState }, { headers });
}
