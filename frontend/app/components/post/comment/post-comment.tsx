import { postDateFormat } from "@/lib/utils/formatter";
import { Comment, Profile, User } from "@/types";
import { Comment as CommentIcon, Like } from "../../icons";
import CommentButton from "../../shared/comment-button";
import LikeButton from "../../shared/like-button";
import { Avatar, AvatarFallback, CldAvatarImage } from "../../ui/avatar";
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
        <Avatar className="w-8 h-8">
          <CldAvatarImage src={profile.avatar || undefined} />
          <AvatarFallback>{profile.name[0]}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col gap-y-2">
        <p className="text-sm flex items-center gap-3">
          <span className="font-semibold">{profile.username}</span>
          <span className="text-muted-foreground">{postDateFormat(comment.createdAt)}</span>
        </p>
        <p className="text-sm">{comment.text}</p>
        <div className="mt-2 -ml-3 flex items-center gap-x-2">
          {user && (
            <>
              <LikeButton
                id={comment.id}
                type="comment"
                hasLiked={hasLiked}
                count={comment.likes.length}
              />
              <CommentButton
                postId={comment.postId}
                parentId={comment.id}
                count={comment.childrenCount}
              />
            </>
          )}
          {!user && (
            <>
              <PostStats count={0}>
                <Like />
              </PostStats>
              <PostStats count={comment.childrenCount}>
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
