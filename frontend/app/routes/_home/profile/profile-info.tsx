import ProfileEditDialog from "@/components/profile/profile-edit-dialog";
import { Avatar, AvatarFallback, CldAvatarImage } from "@/components/ui/avatar";
import { ProfileOverview } from "@/types";

type ProfileInfoProps = {
  profile: ProfileOverview;
};

export default function ProfileInfo({ profile }: ProfileInfoProps) {
  return (
    <div className="flex justify-between gap-6 pb-8">
      <div className="flex justify-center flex-col gap-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-3">
            <p className="text-2xl md:text-3xl font-semibold">{profile.name}</p>
            <ProfileEditDialog {...profile} />
          </div>
          <p className="text-muted-foreground">{"@" + profile.username}</p>
        </div>
        <div className="md:text-lg flex gap-3 md:gap-6 font-medium">
          <div className="flex flex-wrap gap-1.5">
            <p>{profile._count.posts}</p>
            <p>Posts</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <p>{profile._count.follower}</p>
            <p>Followers</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <p>{profile._count.following}</p>
            <p>Following</p>
          </div>
        </div>
        {profile.bio && <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>}
      </div>
      <Avatar className="w-20 h-20 md:w-24 md:h-24">
        <CldAvatarImage src={profile.avatar} responsive={[{ size: { width: 96, height: 96 } }]} />
        <AvatarFallback>{profile.name[0]}</AvatarFallback>
      </Avatar>
    </div>
  );
}
