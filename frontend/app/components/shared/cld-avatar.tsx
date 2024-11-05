import { BaseProfile } from "@/types";
import { Avatar, AvatarFallback, CldAvatarImage } from "../ui/avatar";

type CldAvatarProps = {
  avatar: BaseProfile["avatar"];
  name: BaseProfile["name"];
  width?: number;
  height?: number;
  className?: string;
};

export default function CldAvatar({ avatar, name, className, width, height }: CldAvatarProps) {
  return (
    <Avatar className={className}>
      <CldAvatarImage src={avatar || undefined} width={width} height={height} />
      <AvatarFallback>{name[0]}</AvatarFallback>
    </Avatar>
  );
}
