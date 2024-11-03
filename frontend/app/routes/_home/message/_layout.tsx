import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { SocketProvider } from "@/store/context/socket.context";
import { Conversation as TConversation } from "@/types";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, useLoaderData } from "@remix-run/react";
import ConversationNavLink from "./conversation-nav-link";

export async function loader({ request }: LoaderFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const response = await fetch(`${envConfig.API_URL}/conversation?profileId=${user.id}`);

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const conversations: TConversation[] = (await response.json()).conversations;

  return json({ conversations, user }, { headers });
}

export default function MessageLayout() {
  const { conversations, user } = useLoaderData<typeof loader>();

  return (
    <SocketProvider userId={user.id}>
      <div className="mx-auto w-full md:max-w-5xl h-screen flex gap-x-4 p-6">
        <div className="w-full max-w-64 flex flex-col gap-y-3">
          <p className="text-xl font-semibold pb-4">Messages</p>
          {conversations.map((conversation) => (
            <ConversationNavLink key={conversation.id} conversation={conversation} user={user} />
          ))}
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </SocketProvider>
  );
}
