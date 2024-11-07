import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { Conversation as TConversation } from "@/types";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import ConversationNavLink from "../conversation-nav-link";

export async function loader({ request }: LoaderFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const response = await fetch(`${envConfig.API_URL}/conversation?profileId=${user.id}`);

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const conversations: TConversation[] = (await response.json()).conversations;

  return json({ conversations, user }, { headers });
}

export default function Index() {
  const { conversations, user } = useLoaderData<typeof loader>();
  const matches = useMediaQuery("(min-width: 640px)");
  const navigate = useNavigate();

  useEffect(() => {
    if (matches && conversations.length > 0) navigate(`/message/${conversations[0].id}`);
  }, [matches, conversations.length, navigate]);

  return (
    <>
      {matches && conversations.length === 0 && (
        <div className="max-sm:hidden relative w-full bg-muted/20 rounded-xl h-full flex-center">
          <p>Start a conversation now!</p>
        </div>
      )}
      {!matches && (
        <div className="sm:hidden flex flex-col px-6 py-4">
          <p className="text-center text-xl font-semibold mb-4">Messages</p>
          {conversations.map((conversation) => (
            <ConversationNavLink key={conversation.id} conversation={conversation} user={user} />
          ))}
        </div>
      )}
    </>
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
    const message = response.status === 400 ? (await response.json()).message : response.statusText;
    return json({ message }, { headers });
  }

  const conversationId = (await response.json()).conversationId;

  return redirect(`/message/${conversationId}`, { headers });
}
