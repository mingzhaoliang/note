import { Message as TMessage, User } from "@/types";
import { useEffect, useRef } from "react";
import Message from "./message";

type MessageContainerProps = {
  messages: TMessage[];
  user: User;
};

const MessageContainer = ({ messages, user }: MessageContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, []);

  return (
    <div ref={containerRef} className="flex-1 overflow-auto hide-scrollbar scroll-smooth">
      <div className="p-4 flex flex-col-reverse gap-y-4 pb-16">
        {messages.map((message) => (
          <Message
            key={message.id}
            isOwner={message.senderId === user.id}
            content={message.text}
            profile={message.sender}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageContainer;
