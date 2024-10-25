import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const formData = await request.formData();
  formData.append("profileId", user.id);
  const _action = formData.get("_action");
  const postId = formData.get("postId");

  const tags = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("tags"))
    .map(([, value]) => value as string);
  formData.set("tags", JSON.stringify(tags));

  const response = await fetch(`${envConfig.API_URL}/post`, {
    method: "POST",
    body: formData,
  });

  let message, post;
  if (!response.ok) {
    const error = (await response.json()).error;
    message = response ? error : "Oops! Something went wrong!";
  } else {
    post = (await response.json()).post;
  }

  const actionState = { message, _action, postId };

  return json({ post, actionState }, { headers });
}
