import FollowButton from "@/components/profile/follow-button";
import CldAvatar from "@/components/shared/cld-avatar";
import { useSession } from "@/store/context/session.context";
import { BaseProfile } from "@/types";
import { Link } from "@remix-run/react";
import { LockIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import FollowRequestHandler from "./follow-request-handler";

type ProfileListItemProps = {
  profile: Omit<BaseProfile, "bio">;
  isFollowRequest?: boolean;
};

const ProfileListItem = ({ profile, isFollowRequest }: ProfileListItemProps) => {
  const { user } = useSession();

  return (
    <div className="flex gap-x-3">
      <CldAvatar
        avatar={profile.avatar}
        name={profile.name}
        className="w-12 h-12"
        width={120}
        height={120}
      />
      <div className="flex-1 flex flex-col justify-between gap-y-1">
        <div className="flex items-center gap-x-2">
          <Link to={`/profile/${profile.username}`} className="text-sm font-medium hover:underline">
            {profile.username}
          </Link>
          {profile.private && <LockIcon className="w-4 h-4" />}
        </div>
        <p className="text-sm text-muted-foreground">{profile.name}</p>
      </div>
      {profile.id !== user?.id && !isFollowRequest && (
        <FollowButton profile={{ id: profile.id, private: profile.private }} />
      )}
      {isFollowRequest && <FollowRequestHandler requestingProfileId={profile.id} />}
    </div>
  );
};

const ProfileListItemSkeleton = () => (
  <div className="flex gap-x-3">
    <Skeleton className="rounded-full w-12 h-12" />
    <div className="flex-1 flex flex-col justify-between gap-y-1">
      <Skeleton className="w-32 h-5" />
      <Skeleton className="w-24 h-5" />
    </div>
  </div>
);

export { ProfileListItem, ProfileListItemSkeleton };