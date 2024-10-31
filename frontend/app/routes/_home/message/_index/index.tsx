import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/react";

export default function Index() {
  return (
    <div className="relative w-full bg-muted/20 rounded-xl h-full flex-center">
      <p>Start a conversation now!</p>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const formData = await request.formData();
  const recipientId = formData.get("recipientId");

  const response = await fetch(`${envConfig.API_URL}/conversation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId: user.id,
      recipientId: recipientId,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()).error;
    return json({ error }, { headers });
  }

  const conversationId = (await response.json()).conversationId;

  return redirect(`/message/${conversationId}`, { headers });
}
