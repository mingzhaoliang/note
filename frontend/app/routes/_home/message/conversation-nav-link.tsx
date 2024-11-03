import CldAvatar from "@/components/shared/cld-avatar";
import { cn } from "@/lib/utils/cn";
import { useSocket } from "@/store/context/socket.context";
import { Conversation, Message, User } from "@/types";
import { NavLink } from "@remix-run/react";
import { useEffect } from "react";
import { useImmer } from "use-immer";

type ConversationProps = {
  conversation: Conversation;
  user: User;
};

const ConversationNavLink = ({ conversation, user }: ConversationProps) => {
  const profile = conversation.participants.filter((participant) => participant.id !== user.id)[0];
  const [lastMessage, setLastMessage] = useImmer(conversation.lastMessage);
  const isLastMessageMine = lastMessage?.senderId === user.id;
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (message: Message) => {
      if (message.conversationId !== conversation.id) return;

      setLastMessage(message);
    });

    socket.on("messageSeen", ({ conversationId }) => {
      if (conversationId !== conversation.id) return;

      setLastMessage((draft) => {
        if (!draft) return;
        draft.seen = true;
      });
    });
  }, [socket]);

  return (
    <NavLink
      to={`/message/${conversation.id}`}
      className={({ isActive }) =>
        cn("p-2 flex-between gap-x-3 rounded-xl hover:bg-muted/40", isActive && "bg-muted/40")
      }
      end
    >
      {({ isActive }) => (
        <>
          <CldAvatar profile={profile} className="w-16 h-16" />
          <div className="flex-1 flex flex-col justify-between gap-y-2 overflow-hidden">
            <p className="text-sm font-semibold">{profile.username}</p>
            <p className="text-xs text-ellipsis text-nowrap overflow-hidden">
              {(isLastMessageMine ? "You: " : "") + lastMessage?.text}
            </p>
          </div>
          {!isActive && lastMessage && !isLastMessageMine && !lastMessage.seen && (
            <div className="self-start mt-1 w-2 h-2 rounded-full bg-destructive" />
          )}
        </>
      )}
    </NavLink>
  );
};

export default ConversationNavLink;
