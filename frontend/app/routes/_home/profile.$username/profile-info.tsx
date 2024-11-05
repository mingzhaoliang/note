import FollowButton from "@/components/profile/follow-button";
import MessageButton from "@/components/profile/message-button";
import ProfileEditDialog from "@/components/profile/profile-edit-dialog";
import CldAvatar from "@/components/shared/cld-avatar";
import { useSession } from "@/store/context/session.context";
import { Profile, User } from "@/types";

type ProfileInfoProps = {
  profile: Profile;
  user: User | null;
};

export default function ProfileInfo({ profile, user }: ProfileInfoProps) {
  const isOwner = user?.id === profile.id;
  const isFollowing = profile.follower.some((followerId) => followerId === user?.id);

  return (
    <div className="flex justify-between gap-6">
      <div className="flex justify-center flex-col gap-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-3">
            <p className="text-2xl md:text-3xl font-semibold">{profile.name}</p>
            {isOwner && <ProfileEditDialog {...profile} />}
          </div>
          <p className="text-muted-foreground">{"@" + profile.username}</p>
        </div>
        <div className="md:text-lg flex gap-3 md:gap-6 font-medium">
          <div className="flex flex-wrap gap-1.5">
            <p>{profile.postCount}</p>
            <p>Posts</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <p>{profile.follower.length}</p>
            <p>Followers</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <p>{profile.following.length}</p>
            <p>Following</p>
          </div>
        </div>
        {profile.bio && <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>}
        {!isOwner && (
          <div className="flex gap-x-2">
            <FollowButton profile={{ id: profile.id, private: profile.private }} />
            <MessageButton profileId={profile.id} />
          </div>
        )}
      </div>
      <CldAvatar
        className="w-20 h-20 md:w-24 md:h-24"
        avatar={profile.avatar}
        name={profile.name}
      />
    </div>
  );
}
