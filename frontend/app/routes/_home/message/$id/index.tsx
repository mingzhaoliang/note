import CldAvatar from "@/components/shared/cld-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { BaseConversation, Message } from "@/types";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  json,
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { ArrowLeftIcon, SendHorizonalIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import MessageContainer, { MessageContainerRef } from "./message-container";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const { id: conversationId } = params;

  const lastMessageId = new URL(request.url).searchParams.get("lastMessageId");

  const conversationResponse = await fetch(`${envConfig.API_URL}/conversation/${conversationId}`);

  if (!conversationResponse.ok) throw new Error("Oops! Something went wrong!");

  const messagesResponse = await fetch(
    `${envConfig.API_URL}/conversation/${conversationId}/messages` +
      (lastMessageId ? `?lastMessageId=${lastMessageId}` : "")
  );

  if (!messagesResponse.ok) throw new Error("Oops! Something went wrong!");

  const conversation: BaseConversation = (await conversationResponse.json()).conversation;

  const { messages, remaining } = (await messagesResponse.json()) as {
    messages: Message[];
    remaining: number;
  };

  return json({ conversation, messages, remaining, user }, { headers });
}

export default function Index() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const msgContainerRef = useRef<MessageContainerRef>(null);
  const { conversation, messages, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const recipientProfile = conversation.participants.filter((profile) => profile.id !== user.id)[0];

  useEffect(() => {
    if (navigation.state !== "idle" || !actionData) return;
    const { newMessage, actionState } = actionData;

    if (actionState.message) {
      toast({
        variant: "primary",
        title: actionState.message,
      });
    } else {
      formRef.current?.reset();
      msgContainerRef.current?.addMessage(newMessage);
    }
  }, [actionData, navigation.state, toast]);

  return (
    <div className="relative w-full bg-muted/20 rounded-xl h-full flex flex-col">
      <div className="flex items-center gap-x-3 p-4 border-b border-muted">
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </Button>
        <CldAvatar
          avatar={recipientProfile.avatar}
          name={recipientProfile.name}
          className="w-12 h-12"
        />
        <Link
          to={`/profile/${recipientProfile.username}`}
          className="font-semibold hover:underline"
        >
          {recipientProfile.username}
        </Link>
      </div>
      <MessageContainer
        ref={msgContainerRef}
        key={conversation.id}
        conversationId={conversation.id}
        initialMessages={messages}
        user={user}
      />
      <Form
        ref={formRef}
        method="POST"
        className="absolute left-0 right-0 bottom-0 flex items-center gap-2 bg-muted/85 backdrop-blur-md backdrop-saturate-200 rounded-full mx-2 px-4 py-1"
      >
        <Input
          name="text"
          placeholder="Say something..."
          className="masked-input no-highlight"
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
        />
        <SendHorizonalIcon className="w-6 h-6" />
      </Form>
    </div>
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const { id: conversationId } = params;

  const formData = await request.formData();
  const text = formData.get("text");

  const response = await fetch(`${envConfig.API_URL}/conversation/${conversationId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId: user.id,
      text,
    }),
  });

  if (!response.ok) {
    const message = response.status === 400 ? (await response.json()).message : response.statusText;
    return json({ newMessage: null, actionState: { message } }, { headers });
  }

  const newMessage = (await response.json()).message;

  return json({ newMessage, actionState: { message: null } }, { headers });
}
