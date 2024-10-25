import { BaseProfile } from "@/types";
import { Avatar, AvatarFallback, CldAvatarImage } from "../ui/avatar";

type CldAvatarProps = {
  profile: BaseProfile;
  className?: string;
};

export default function CldAvatar({ profile, className }: CldAvatarProps) {
  return (
    <Avatar className={className}>
      <CldAvatarImage src={profile.avatar || undefined} />
      <AvatarFallback>{profile.name[0]}</AvatarFallback>
    </Avatar>
  );
}
