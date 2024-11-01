import { BaseProfile } from "@/types";
import { Avatar, AvatarFallback, CldAvatarImage } from "../ui/avatar";

type CldAvatarProps = {
  profile: BaseProfile;
  width?: number;
  height?: number;
  className?: string;
};

export default function CldAvatar({ profile, className, width, height }: CldAvatarProps) {
  return (
    <Avatar className={className}>
      <CldAvatarImage src={profile.avatar || undefined} width={width} height={height} />
      <AvatarFallback>{profile.name[0]}</AvatarFallback>
    </Avatar>
  );
}
