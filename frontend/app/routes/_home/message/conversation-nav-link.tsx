import CldAvatar from "@/components/shared/cld-avatar";
import { cn } from "@/lib/utils/cn";
import { Conversation, User } from "@/types";
import { NavLink } from "@remix-run/react";

type ConversationProps = {
  conversation: Conversation;
  user: User;
};

const ConversationNavLink = ({ conversation, user }: ConversationProps) => {
  const profile = conversation.participants.filter((participant) => participant.id !== user.id)[0];
  const lastMessage = conversation.lastMessage;
  const isLastMessageMine = lastMessage?.senderId === user.id;

  return (
    <NavLink
      to={`/message/${conversation.id}`}
      className={({ isActive }) =>
        cn("p-2 flex-between gap-x-3 rounded-xl hover:bg-muted/40", isActive && "bg-muted/40")
      }
      end
    >
      <CldAvatar profile={profile} className="w-16 h-16" />
      <div className="flex-1 flex flex-col justify-between gap-y-2 overflow-hidden">
        <p className="text-sm font-semibold">{profile.username}</p>
        <p className="text-xs text-ellipsis text-nowrap overflow-hidden">
          {(isLastMessageMine ? "You: " : "") + lastMessage?.text}
        </p>
      </div>
    </NavLink>
  );
};

export default ConversationNavLink;
