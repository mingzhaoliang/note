import { Comment, Like } from "@/components/icons";
import PostImages from "@/components/post/post-card/post-images";
import PostStats from "@/components/post/post-card/post-stats";
import CldAvatar from "@/components/shared/cld-avatar";
import CommentButton from "@/components/shared/comment-button";
import LikeButton from "@/components/shared/like-button";
import TagButton from "@/components/shared/tag-button";
import UsernameButton from "@/components/shared/username-button";
import { OnRevalidate } from "@/hooks/use-revalidate-post";
import { postDateFormat } from "@/lib/utils/formatter";
import { useSession } from "@/store/context/session.context";
import { ProfileComment } from "@/types";
import { Link } from "@remix-run/react";
import { useCallback } from "react";
import { Updater } from "use-immer";

type CommentOnItemProps = ProfileComment["commentOn"] & {
  setProfileComments: Updater<ProfileComment[]>;
};

const CommentOnItem = ({
  id,
  text,
  profile,
  images,
  createdAt,
  tags,
  likes,
  commentCount,
  commentOnUsername,
  setProfileComments,
}: CommentOnItemProps) => {
  const { user } = useSession();
  const hasLiked = user ? likes.includes(user.id) : false;

  const handleRevalidate: OnRevalidate = useCallback((updatedComment, actionState) => {
    if (!updatedComment) return;
    setProfileComments((draft) => {
      const targetComment = draft.find((comment) => comment.commentOn.id === actionState.postId);
      if (targetComment) {
        targetComment.commentOn.likes = updatedComment.likes;
        targetComment.commentOn.commentCount = updatedComment.commentCount;
      }
    });
  }, []);

  return (
    <Link to={`/profile/${profile.username}/post/${id}`}>
      <div className="w-full flex space-x-3">
        <div className="flex-center flex-col">
          <CldAvatar profile={profile} />
          <div className="flex-1 border-l-2 my-2 border-muted" />
        </div>
        <div className="w-full flex flex-col space-y-2">
          <div className="py-1 gap-3">
            <div className="text-sm flex items-center gap-3">
              <UsernameButton username={profile.username} />
              <p className="text-muted-foreground">{postDateFormat(createdAt)}</p>
            </div>
            {commentOnUsername && (
              <p className="text-sm text-muted-foreground">
                Replying to <UsernameButton username={commentOnUsername} />
              </p>
            )}
          </div>
          {images.length > 0 && <PostImages images={images} />}
          <div className="flex items-center flex-wrap gap-2">
            <p className="text-foreground">{text}</p>
            {tags.map((tag, index) => (
              <TagButton key={tag + index} tag={tag} />
            ))}
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

export default CommentOnItem;
