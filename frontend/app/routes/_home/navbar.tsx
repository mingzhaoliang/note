import { Home, HomeFilled, Message, MessageFilled, Person, PersonFilled } from "@/components/icons";
import { useSession } from "@/store/context/session.context";
import { useSocket } from "@/store/context/socket.context";
import { Message as TMessage } from "@/types";
import { useRouteLoaderData } from "@remix-run/react";
import { PaletteIcon } from "lucide-react";
import { useEffect } from "react";
import { useImmer } from "use-immer";
import CreatePostButton from "./create-post-button";
import { loader } from "./message/_layout";
import NavItem from "./nav-item";

export default function Navbar() {
  const { user } = useSession();

  return (
    <nav className="max-md:navbar-mobile md:navbar">
      <NavItem
        to="/"
        preventScrollReset
        DefaultIcon={Home}
        ActiveIcon={HomeFilled}
        prefetch="intent"
      />
      <NavItem to="/explore" DefaultIcon={PaletteIcon} prefetch="intent" />
      <CreatePostButton />
      <MessageButton />
      <NavItem
        to={`/profile/${user?.username}`}
        DefaultIcon={Person}
        ActiveIcon={PersonFilled}
        isProtected
        end
        prefetch="intent"
      />
    </nav>
  );
}

const MessageButton = () => {
  const socket = useSocket();
  const loaderData = useRouteLoaderData<typeof loader>("routes/_home/message/_layout");
  const [unseenMessages, setUnseenMessages] = useImmer<(TMessage | null)[]>(
    loaderData?.conversations?.map((c) => c.lastMessage) || []
  );
  const hasUnseenMessages = unseenMessages.some((m) => m?.seen === false);

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (message: TMessage) => {
      setUnseenMessages((draft) => {
        if (draft.some((m) => m?.id === message.id)) return;
        draft.unshift(message);
      });
    });

    socket.on("messageSeen", ({ conversationId }) => {
      setUnseenMessages((draft) => {
        draft
          .filter((message) => message !== null && message.conversationId === conversationId)
          .forEach((message) => {
            if (!message) return;
            message.seen = true;
          });
      });
    });
  }, [socket]);

  return (
    <div className="relative">
      <NavItem
        to="/message"
        DefaultIcon={Message}
        ActiveIcon={MessageFilled}
        isProtected
        prefetch="intent"
      />
      {hasUnseenMessages && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-destructive" />
      )}
    </div>
  );
};
