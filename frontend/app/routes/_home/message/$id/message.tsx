import CldAvatar from "@/components/shared/cld-avatar";
import { cn } from "@/lib/utils/cn";
import { Profile } from "@/types";

type MessageProps = {
  isOwner?: boolean;
  content: string;
  profile: Profile;
};

const Message = ({ isOwner = false, content, profile }: MessageProps) => {
  return (
    <div className={cn("flex gap-x-3", isOwner && "flex-row-reverse")}>
      <CldAvatar profile={profile} />
      <p
        className={cn(
          "max-w-xs rounded-xl px-4 py-2",
          isOwner ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {content}
      </p>
    </div>
  );
};

export default Message;
