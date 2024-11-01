import { Comment as CommentIcon, Like } from "@/components/icons";
import CldAvatar from "@/components/shared/cld-avatar";
import CommentButton from "@/components/shared/comment-button";
import LikeButton from "@/components/shared/like-button";
import UsernameButton from "@/components/shared/username-button";
import { postDateFormat } from "@/lib/utils/formatter";
import { BaseProfile, Comment, User } from "@/types";
import PostStats from "../post-card/post-stats";

type CommentDetailsProps = {
  profile: BaseProfile;
  comment: Comment;
  user: User | null;
};

const PostComment = ({ profile, comment, user }: CommentDetailsProps) => {
  const hasLiked = user ? comment.likes.includes(user.id) : false;

  return (
    <div className="flex gap-x-3">
      <div className="flex items-center flex-col pb-1">
        <CldAvatar className="w-8 h-8" profile={profile} />
      </div>
      <div className="flex flex-col">
        <div className="mb-2 text-sm flex items-center gap-3">
          <UsernameButton username={profile.username} />
          <p className="text-muted-foreground">{postDateFormat(comment.createdAt)}</p>
        </div>
        <p className="text-sm">{comment.text}</p>
        <div className="-ml-3 flex items-center gap-x-2">
          {user && (
            <>
              <LikeButton
                id={comment.id}
                hasLiked={hasLiked}
                count={comment.likes.length}
                onRevalidate={() => {}}
              />
              <CommentButton
                commentOnId={comment.id}
                count={comment.commentCount}
                onRevalidate={() => {}}
              />
            </>
          )}
          {!user && (
            <>
              <PostStats count={0}>
                <Like />
              </PostStats>
              <PostStats count={comment.commentCount}>
                <CommentIcon />
              </PostStats>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostComment;
