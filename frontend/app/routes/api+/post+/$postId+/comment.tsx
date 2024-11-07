import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const formData = await request.formData();
  formData.append("profileId", user.id);
  const commentOnId = formData.get("commentOnId");

  const response = await fetch(`${envConfig.API_URL}/post/comment`, {
    method: "POST",
    body: formData,
  });

  let message, post;
  if (!response.ok) {
    message = response.status === 400 ? (await response.json()).message : response.statusText;
  } else {
    post = (await response.json()).post;
  }

  const actionState = { message, postId: commentOnId };

  return json({ post, actionState }, { headers });
}
