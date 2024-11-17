import CldAvatar from "@/components/shared/cld-avatar";
import CommentButton from "@/components/shared/comment-button";
import LikeButton from "@/components/shared/like-button";
import TagButton from "@/components/shared/tag-button";
import UsernameButton from "@/components/shared/username-button";
import { cn } from "@/lib/utils/cn";
import { postDateFormat } from "@/lib/utils/formatter";
import { Post } from "@/types";
import { useFetchers } from "@remix-run/react";
import { Loader2Icon } from "lucide-react";
import { memo } from "react";
import PostDropdown from "./post-dropdown";
import PostImages from "./post-images";

type PostCardProps = Post & {
  userId?: string | null;
  className?: string;
  onLikeUnlike?: (data: any) => void;
  onComment?: (data: any) => void;
  onDelete?: (id: string) => void;
};

const PostCard = ({
  userId,
  id: postId,
  images,
  text,
  tags,
  profile: ownerProfile,
  likes,
  createdAt,
  _count,
  className,
  onLikeUnlike,
  onComment,
  onDelete,
}: PostCardProps) => {
  const isOwner = userId === ownerProfile.id;
  const fetchers = useFetchers();
  const relevantRegex = /^\/profile\/[^/]+\/post\/[^/]+$/;
  const relevantFetchers = fetchers.filter(
    (fetcher) => fetcher.formAction && relevantRegex.test(fetcher.formAction)
  );
  const fetcherFormData = relevantFetchers[0]?.formData;
  const isCreating =
    fetcherFormData?.get("_action") === "create" && fetcherFormData?.get("postId") === postId;
  const isDeleting =
    fetcherFormData?.get("_action") === "delete" && fetcherFormData?.get("postId") === postId;

  const hasLiked = userId ? likes.includes(userId) : false;

  return (
    <div className={cn("w-full flex space-x-3 py-4", isDeleting && "hidden", className)}>
      <div className="flex-center flex-col pb-8">
        <CldAvatar avatar={ownerProfile.avatar} name={ownerProfile.name} />
        <div className="flex-1 border-l border-muted" />
      </div>
      <div className="w-full flex flex-col space-y-4">
        <div className="py-1 flex-between gap-3">
          <div className="text-sm flex-center gap-3">
            <UsernameButton username={ownerProfile.username} />
            <p className="text-muted-foreground">{postDateFormat(createdAt)}</p>
          </div>
          {isCreating ? (
            <Loader2Icon className="animate-spin text-inactive" />
          ) : (
            <PostDropdown isOwner={isOwner} postId={postId} onDelete={onDelete} />
          )}
        </div>
        {images.length > 0 && <PostImages images={images} isLocal={isCreating} />}
        <div className="flex items-center flex-wrap gap-2">
          <p className="text-foreground">{text}</p>
          {tags.map((tag, index) => (
            <TagButton key={tag + index} tag={tag} />
          ))}
        </div>
        <div className="mt-2 -ml-3 flex items-center">
          <LikeButton
            postId={postId}
            postOwnerUsername={ownerProfile.username}
            hasLiked={hasLiked}
            count={_count.likes}
            onAction={onLikeUnlike}
          />
          <CommentButton
            postOwnerUsername={ownerProfile.username}
            parentId={postId}
            count={_count.comments}
            onAction={onComment}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(PostCard);
