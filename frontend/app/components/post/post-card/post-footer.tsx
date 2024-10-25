import { Comment, Like } from "@/components/icons";
import CommentButton from "@/components/shared/comment-button";
import LikeButton from "@/components/shared/like-button";
import PostStats from "./post-stats";

type PostFooterProps = {
  postId: string;
  userId?: string | null;
  likes: string[];
  commentCount: number;
};

const PostFooter = ({ postId, userId, likes, commentCount }: PostFooterProps) => {
  const hasLiked = userId ? likes.includes(userId) : false;

  return (
    <div className="mt-2 -ml-3 flex items-center">
      {userId && (
        <>
          <LikeButton id={postId} type="post" hasLiked={hasLiked} count={likes.length} />
          <CommentButton commentOnId={postId} count={commentCount} />
        </>
      )}
      {!userId && (
        <>
          <PostStats count={likes.length}>
            <Like />
          </PostStats>
          <PostStats count={commentCount}>
            <Comment />
          </PostStats>
        </>
      )}
    </div>
  );
};

export default PostFooter;
