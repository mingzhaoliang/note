import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useSession } from "@/store/context/session.context";
import { useSocket } from "@/store/context/socket.context";
import { addNotification, markAsSeen } from "@/store/redux/features/notifications-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { NavLink } from "@remix-run/react";
import { BellIcon } from "lucide-react";
import { useEffect } from "react";

const NotificationButton = () => {
  const socket = useSocket();
  const { user } = useSession();
  const notifications = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();
  const hasUnseenNotification = notifications.some((notification) => notification.seen === false);

  const handleClick = () => {
    if (!socket || !user) return;
    socket.emit("notification:mark-as-seen", { userId: user.id });
    dispatch(markAsSeen());
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("notification:follow-request", ({ data }) => {
      dispatch(addNotification(data));
    });
  }, [socket]);

  return (
    <Button variant="ghost" size="icon" className="rounded-full" asChild>
      <NavLink to="/notifications" onClick={handleClick}>
        {({ isActive }) => (
          <div className="relative">
            <BellIcon className={cn(isActive ? "text-primary" : "text-muted-foreground")} />
            {hasUnseenNotification && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
            )}
          </div>
        )}
      </NavLink>
    </Button>
  );
};

export default NotificationButton;
