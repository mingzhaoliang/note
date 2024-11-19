import LoginModal from "@/components/auth/login-modal";
import FollowButton from "@/components/profile/follow-button";
import MessageButton from "@/components/profile/message-button";
import ProfileEditDialog from "@/components/profile/profile-edit-dialog";
import CldAvatar from "@/components/shared/cld-avatar";
import { useSession } from "@/store/context/session.context";
import { Profile } from "@/types";
import RelationshipDialog from "./relationship-dialog";

export default function ProfileInfo({ profile }: { profile: Profile }) {
  const { user } = useSession();
  const isOwner = user?.id === profile.id;
  const followerCount = profile._count.follower;

  return (
    <div className="flex justify-between gap-6">
      <div className="flex justify-center flex-col gap-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-3">
            <p className="text-2xl md:text-3xl font-semibold">{profile.name}</p>
            {isOwner && (
              <ProfileEditDialog name={profile.name} bio={profile.bio} avatar={profile.avatar} />
            )}
          </div>
          <p className="text-muted-foreground">{"@" + profile.username}</p>
        </div>
        {!user && (
          <LoginModal>
            <p className="text-start text-sm text-muted-foreground">
              {followerCount} {followerCount <= 1 ? "Follower" : "Followers"}
            </p>
          </LoginModal>
        )}
        {user && <RelationshipDialog followerCount={followerCount} isOwner={isOwner} />}
        {profile.bio && <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>}
        {!isOwner && user && (
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
