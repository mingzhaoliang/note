import { Comment, Like } from "@/components/icons";
import CommentButton from "@/components/shared/comment-button";
import LikeButton from "@/components/shared/like-button";
import { OnRevalidate } from "@/hooks/use-revalidate-post";
import { RevalidatePostStats } from "@/store/redux/features/post-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import { useCallback } from "react";
import PostStats from "./post-stats";

type PostFooterProps = {
  postId: string;
  userId?: string | null;
  likes: string[];
  commentCount: number;
};

const PostFooter = ({ postId, userId, likes, commentCount }: PostFooterProps) => {
  const hasLiked = userId ? likes.includes(userId) : false;

  const dispatch = useAppDispatch();

  const handleRevalidate: OnRevalidate = useCallback((updatedPost, actionState) => {
    if (!updatedPost) return;
    dispatch(RevalidatePostStats({ updatedPost, postId: actionState.postId }));
  }, []);

  return (
    <div className="mt-2 -ml-3 flex items-center">
      {userId && (
        <>
          <LikeButton
            id={postId}
            hasLiked={hasLiked}
            count={likes.length}
            onRevalidate={handleRevalidate}
          />
          <CommentButton
            commentOnId={postId}
            count={commentCount}
            onRevalidate={handleRevalidate}
          />
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
