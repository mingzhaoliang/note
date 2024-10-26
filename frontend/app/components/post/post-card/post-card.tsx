import CldAvatar from "@/components/shared/cld-avatar";
import TagButton from "@/components/shared/tag-button";
import UsernameButton from "@/components/shared/username-button";
import { cn } from "@/lib/utils/cn";
import { postDateFormat } from "@/lib/utils/formatter";
import { Post } from "@/types";
import { useFetcher } from "@remix-run/react";
import { Loader2Icon } from "lucide-react";
import { memo } from "react";
import PostDropdown from "./post-dropdown";
import PostFooter from "./post-footer";
import PostImages from "./post-images";

type PostCardProps = Post & {
  userId?: string | null;
  className?: string;
};

const PostCard = ({
  userId,
  id: postId,
  images,
  text,
  tags,
  profile,
  likes,
  createdAt,
  commentCount,
  className,
}: PostCardProps) => {
  const isOwner = userId === profile.id;
  const fetcher = useFetcher({ key: "post" });
  const fetcherFormData = fetcher.formData;
  const isCreating =
    fetcherFormData?.get("_action") === "create" && fetcherFormData?.get("postId") === postId;
  const isDeleting =
    fetcherFormData?.get("_action") === "delete" && fetcherFormData?.get("postId") === postId;

  return (
    <div className={cn("w-full flex space-x-3 py-4", isDeleting && "hidden", className)}>
      <div className="flex-center flex-col pb-8">
        <CldAvatar profile={profile} />
        <div className="flex-1 border-l border-muted" />
      </div>
      <div className="w-full flex flex-col space-y-4">
        <div className="py-1 flex-between gap-3">
          <div className="text-sm flex-center gap-3">
            <UsernameButton username={profile.username} />
            <p className="text-muted-foreground">{postDateFormat(createdAt)}</p>
          </div>
          {isCreating ? (
            <Loader2Icon className="animate-spin text-inactive" />
          ) : (
            <PostDropdown isOwner={isOwner} postId={postId} />
          )}
        </div>
        {images.length > 0 && <PostImages images={images} isLocal={isCreating} />}
        <div className="flex items-center flex-wrap gap-2">
          <p className="text-foreground">{text}</p>
          {tags.map((tag, index) => (
            <TagButton key={tag + index} tag={tag} />
          ))}
        </div>
        <PostFooter postId={postId} userId={userId} likes={likes} commentCount={commentCount} />
      </div>
    </div>
  );
};

export default memo(PostCard);
