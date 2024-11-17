import CldAvatar from "@/components/shared/cld-avatar";
import CommentButton from "@/components/shared/comment-button";
import LikeButton from "@/components/shared/like-button";
import UsernameButton from "@/components/shared/username-button";
import { postDateFormat } from "@/lib/utils/formatter";
import { BaseProfile, Comment, User } from "@/types";

type CommentDetailsProps = {
  profile: BaseProfile;
  comment: Comment;
  user: User | null;
};

const CommentItem = ({ profile, comment, user }: CommentDetailsProps) => {
  const hasLiked = user ? comment.likes.includes(user.id) : false;

  return (
    <div className="flex gap-x-3">
      <div className="flex items-center flex-col pb-1">
        <CldAvatar className="w-8 h-8" avatar={profile.avatar} name={profile.name} />
      </div>
      <div className="flex flex-col">
        <div className="mb-2 text-sm flex items-center gap-3">
          <UsernameButton username={profile.username} />
          <p className="text-muted-foreground">{postDateFormat(comment.createdAt)}</p>
        </div>
        <p className="text-sm">{comment.text}</p>
        <div className="-ml-3 flex items-center gap-x-2">
          <LikeButton
            postId={comment.id}
            postOwnerUsername={profile.username}
            hasLiked={hasLiked}
            count={comment._count.likes}
          />
          <CommentButton
            parentId={comment.id}
            postOwnerUsername={profile.username}
            count={comment._count.comments}
          />
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
