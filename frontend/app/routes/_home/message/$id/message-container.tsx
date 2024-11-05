import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/store/context/socket.context";
import { Message as TMessage, User } from "@/types";
import { ArrowDownIcon, LoaderIcon } from "lucide-react";
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
    const [latestMessageInView, setLatestMessageInView] = useImmer(true);
    const lastMessageId = messages[messages.length - 1]?.id;
    const latestMessageRef = useRef<HTMLDivElement>(null);
    const socket = useSocket();
    const unseenMessages = messages.filter(
      (message) => !message.seen && message.senderId !== user.id
    );

    const handleLoadMessages = useCallback(
      ({ messages: loadedMessages }: { messages: TMessage[] | null }) => {
        if (!loadedMessages) return;
        setMessages((draft) => {
          draft.push(...loadedMessages);
        });
      },
      []
    );

    const scrollToEnd = useCallback(() => {
      latestMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

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

    useEffect(() => {
      if (!socket) return;

      socket.on("newMessage", (message: TMessage) => {
        if (message.conversationId === conversationId) {
          setMessages((draft) => {
            draft.unshift(message);
          });
        }
      });

      socket.on("messageSeen", ({ conversationId: id, seenAt }) => {
        if (id === conversationId) {
          setMessages((draft) => {
            draft
              .filter((message) => message.seen === false)
              .forEach((message) => {
                message.seen = true;
                message.seenAt = seenAt;
              });
          });
        }
      });
    }, [socket, conversationId]);

    useEffect(() => {
      if (!socket) return;
      const latestMessage = messages[0];
      if (!latestMessage || latestMessage.seen || latestMessage.senderId === user.id) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              socket.emit("markMessageAsSeen", {
                conversationId,
                senderId: latestMessage.senderId,
                recipientId: user.id,
              });

              setMessages((draft) => {
                draft
                  .filter((message) => message.seen === false)
                  .forEach((message) => {
                    message.seen = true;
                  });
              });

              setLatestMessageInView(true);
            } else {
              setLatestMessageInView(false);
            }
          });
        },
        {
          root: containerRef.current,
          rootMargin: "-48px",
          threshold: 0.8,
        }
      );

      const element = latestMessageRef.current;

      if (!element) return;

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }, [messages, socket, user.id]);

    return (
      <>
        <div
          ref={containerRef}
          className="relative flex flex-col-reverse gap-y-4 hide-scrollbar p-4 pb-16 overflow-auto"
        >
          {messages.map((message, index) => (
            <Message
              ref={index === 0 ? latestMessageRef : undefined}
              key={message.id}
              isOwner={message.senderId === user.id}
              isLatest={index === 0}
              {...message}
            />
          ))}
          <InfiniteScrollTrigger
            onLoad={handleLoadMessages}
            loaderRoute={`/message/${conversationId}?lastMessageId=${lastMessageId}`}
            loaderComponent={<LoaderIcon className="animate-spin text-inactive" />}
          />
        </div>
        {unseenMessages.length > 0 && !latestMessageInView && (
          <Button
            size="sm"
            className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full !h-fit py-1"
            onClick={scrollToEnd}
          >
            <p>{`${unseenMessages.length} new message${unseenMessages.length > 1 ? "s" : ""}`}</p>
            <ArrowDownIcon className="ml-1 w-4 h-4" />
          </Button>
        )}
      </>
    );
  }
);

export default MessageContainer;
