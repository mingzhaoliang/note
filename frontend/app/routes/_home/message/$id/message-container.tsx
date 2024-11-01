import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import { Message as TMessage, User } from "@/types";
import { LoaderIcon } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { useImmer } from "use-immer";
import Message from "./message";

export type MessageContainerRef = {
  addMessage: (message: TMessage) => void;
};

type MessageContainerProps = {
  conversationId: string;
  initialMessages: TMessage[];
  user: User;
};

const MessageContainer = forwardRef<MessageContainerRef, MessageContainerProps>(
  ({ conversationId, initialMessages, user }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useImmer(initialMessages);
    const lastMessageId = messages[messages.length - 1]?.id;

    const handleLoadMessages = useCallback(
      ({ messages: loadedMessages }: { messages: TMessage[] | null }) => {
        if (!loadedMessages) return;
        setMessages((draft) => {
          draft.push(...loadedMessages);
        });
      },
      []
    );

    useImperativeHandle(ref, () => {
      return {
        addMessage(message) {
          setMessages((draft) => {
            draft.unshift(message);
          });
          containerRef.current!.scrollTop = containerRef.current!.scrollHeight;
        },
      };
    });

    useEffect(() => {
      if (!containerRef.current) return;
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }, []);

    return (
      <div
        ref={containerRef}
        className="flex flex-col-reverse gap-y-4 hide-scrollbar p-4 pb-16 overflow-auto"
      >
        {messages.map((message) => (
          <Message
            key={message.id}
            isOwner={message.senderId === user.id}
            content={message.text}
            profile={message.sender}
          />
        ))}
        <InfiniteScrollTrigger
          onLoad={handleLoadMessages}
          loaderRoute={`/message/${conversationId}?lastMessageId=${lastMessageId}`}
          loaderComponent={<LoaderIcon className="animate-spin text-inactive" />}
        />
      </div>
    );
  }
);

export default MessageContainer;
