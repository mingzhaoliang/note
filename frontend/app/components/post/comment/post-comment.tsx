import CldAvatar from "@/components/shared/cld-avatar";
import { postDateFormat } from "@/lib/utils/formatter";
import { Comment, Profile, User } from "@/types";
import { Comment as CommentIcon, Like } from "../../icons";
import CommentButton from "../../shared/comment-button";
import LikeButton from "../../shared/like-button";
import PostStats from "../post-card/post-stats";

type CommentDetailsProps = {
  profile: Profile;
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
        <p className="mb-2 text-sm flex items-center gap-3">
          <span className="font-semibold">{profile.username}</span>
          <span className="text-muted-foreground">{postDateFormat(comment.createdAt)}</span>
        </p>
        <p className="text-sm">{comment.text}</p>
        <div className="-ml-3 flex items-center gap-x-2">
          {user && (
            <>
              <LikeButton
                id={comment.id}
                type="comment"
                hasLiked={hasLiked}
                count={comment.likes.length}
              />
              <CommentButton commentOnId={comment.id} count={comment.commentCount} />
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
