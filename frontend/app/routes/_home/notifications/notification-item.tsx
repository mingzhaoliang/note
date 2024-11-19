import FollowButton from "@/components/profile/follow-button";
import FollowRequestHandler from "@/components/profile/follow-request-handler";
import CldAvatar from "@/components/shared/cld-avatar";
import { useSession } from "@/store/context/session.context";
import { Notification } from "@/types";
import { Link } from "@remix-run/react";
import { forwardRef } from "react";

const NotificationItem = forwardRef<HTMLDivElement, Omit<Notification, "id">>(
  ({ notificationTypeId, message, sender, relatedId, seen, createdAt }, ref) => {
    const { user } = useSession();
    return (
      <div ref={ref} className="w-full flex-between gap-x-4">
        {sender && (
          <Link to={`/profile/${sender.username}`}>
            <CldAvatar avatar={sender.avatar} name={sender.name} width={120} height={120} />
          </Link>
        )}
        {[1, 2, 3, 4].includes(notificationTypeId) && (
          <Link to={`/profile/${user!.username}/post/${relatedId}`} className="flex-1">
            {message}
          </Link>
        )}
        {notificationTypeId === 5 &&
          sender &&
          (user?.profile.follower.some((f) => f.id === sender.id && f.status === "CONFIRMED") ? (
            <>
              <div className="flex-1">{sender.username} started following you.</div>
              <FollowButton profile={{ id: sender.id, private: sender.private }} />
            </>
          ) : (
            <>
              <div className="flex-1">{message}</div>
              <FollowRequestHandler requestingProfileId={sender.id} />
            </>
          ))}
      </div>
    );
  }
);

NotificationItem.displayName = "NotificationItem";

export default NotificationItem;
