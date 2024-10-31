import CldAvatar from "@/components/shared/cld-avatar";
import { Input } from "@/components/ui/input";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { BaseConversation, Message as TMessage } from "@/types";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { SendHorizonalIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import MessageContainer from "./message-container";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const { id: conversationId } = params;

  const conversationResponse = await fetch(`${envConfig.API_URL}/conversation/${conversationId}`);

  if (!conversationResponse.ok) throw new Error("Oops! Something went wrong!");

  const messagesResponse = await fetch(
    `${envConfig.API_URL}/conversation/${conversationId}/messages`
  );

  if (!messagesResponse.ok) throw new Error("Oops! Something went wrong!");

  const conversation: BaseConversation = (await conversationResponse.json()).conversation;

  const messages: TMessage[] = (await messagesResponse.json()).messages;

  return json({ conversation, messages, user }, { headers });
}

export default function Index() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { conversation, messages, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const recipientProfile = conversation.participants.filter((profile) => profile.id !== user.id)[0];

  useEffect(() => {
    if (navigation.state !== "idle") return;

    if (actionData?.actionState.message) {
      toast({
        variant: "primary",
        title: actionData.actionState.message,
      });
    } else {
      formRef.current?.reset();
    }
  }, [actionData, navigation.state]);

  return (
    <div className="relative w-full bg-muted/20 rounded-xl h-full flex flex-col">
      <div className="flex items-center gap-x-3 p-4 border-b border-muted">
        <CldAvatar profile={recipientProfile} className="w-12 h-12" />
        <p className="font-semibold">{recipientProfile.username}</p>
      </div>
      <MessageContainer messages={messages} user={user} />
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
    const error = (await response.json()).error;
    return json({ actionState: { message: error } }, { headers });
  }

  return json(null, { headers });
}
