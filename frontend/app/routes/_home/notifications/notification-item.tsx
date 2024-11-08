import FollowRequestHandler from "@/components/profile/follow-request-handler";
import CldAvatar from "@/components/shared/cld-avatar";
import { Notification } from "@/types";
import { Link } from "@remix-run/react";

const NotificationItem = ({
  notificationTypeId,
  message,
  sender,
  relatedId,
  seen,
  createdAt,
}: Omit<Notification, "id">) => {
  return (
    <div className="w-full flex-between gap-x-4">
      {sender && (
        <Link to={`/profile/${sender.username}`}>
          <CldAvatar avatar={sender.avatar} name={sender.name} width={120} height={120} />
        </Link>
      )}
      <div className="flex-1">{message}</div>
      {notificationTypeId === 3 && sender && (
        <FollowRequestHandler requestingProfileId={sender.id} />
      )}
    </div>
  );
};

export default NotificationItem;
