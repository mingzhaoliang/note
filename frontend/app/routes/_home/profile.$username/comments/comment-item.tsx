import { Comment, Like } from "@/components/icons";
import PostDropdown from "@/components/post/post-card/post-dropdown";
import PostStats from "@/components/post/post-card/post-stats";
import CldAvatar from "@/components/shared/cld-avatar";
import CommentButton from "@/components/shared/comment-button";
import LikeButton from "@/components/shared/like-button";
import UsernameButton from "@/components/shared/username-button";
import { OnRevalidate, useRevalidatePost } from "@/hooks/use-revalidate-post";
import { postDateFormat } from "@/lib/utils/formatter";
import { useSession } from "@/store/context/session.context";
import { ProfileComment } from "@/types";
import { Link, useFetcher } from "@remix-run/react";
import { useCallback } from "react";
import { Updater } from "use-immer";

type CommentItemProps = Omit<ProfileComment, "commentOn"> & {
  setProfileComments: Updater<ProfileComment[]>;
};

const CommentItem = ({
  profile,
  id,
  text,
  createdAt,
  likes,
  commentCount,
  setProfileComments,
}: CommentItemProps) => {
  const { user } = useSession();
  const isOwner = user?.id === profile.id;
  const hasLiked = user ? likes.includes(user.id) : false;
  const fetcher = useFetcher({ key: "post" });

  const handleRevalidate: OnRevalidate = useCallback((updatedComment, actionState) => {
    if (!updatedComment) return;
    setProfileComments((draft) => {
      const targetComment = draft.find((comment) => comment.id === actionState.postId);
      if (targetComment) {
        targetComment.likes = updatedComment.likes;
        targetComment.commentCount = updatedComment.commentCount;
      }
    });
  }, []);

  const handleDelete: OnRevalidate = useCallback((_, actionState) => {
    setProfileComments((draft) => {
      const index = draft.findIndex((comment) => comment.id === actionState.postId);
      if (index !== -1) {
        draft.splice(index, 1);
      }
    });
  }, []);

  useRevalidatePost(fetcher, handleDelete);

  return (
    <Link to={`/profile/${profile.username}/post/${id}`}>
      <div className="flex gap-x-3">
        <CldAvatar profile={profile} />
        <div className="w-full flex flex-col space-y-2">
          <div className="py-1 flex-between gap-3">
            <div className="text-sm flex-center gap-3">
              <UsernameButton username={profile.username} />
              <p className="text-muted-foreground">{postDateFormat(createdAt)}</p>
            </div>
            <PostDropdown isOwner={isOwner} postId={id} />
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <p className="text-foreground">{text}</p>
          </div>
          <div className="mt-2 -ml-3 flex items-center">
            {user && (
              <>
                <LikeButton
                  id={id}
                  hasLiked={hasLiked}
                  count={likes.length}
                  onRevalidate={handleRevalidate}
                />
                <CommentButton
                  commentOnId={id}
                  count={commentCount}
                  onRevalidate={handleRevalidate}
                />
              </>
            )}
            {!user && (
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
        </div>
      </div>
    </Link>
  );
};

export default CommentItem;
