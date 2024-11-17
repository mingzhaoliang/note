import PostDropdown from "@/components/post/post-card/post-dropdown";
import CldAvatar from "@/components/shared/cld-avatar";
import CommentButton from "@/components/shared/comment-button";
import LikeButton from "@/components/shared/like-button";
import UsernameButton from "@/components/shared/username-button";
import { postDateFormat } from "@/lib/utils/formatter";
import { useSession } from "@/store/context/session.context";
import { updateComment } from "@/store/redux/features/profile-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import { ProfileComment } from "@/types";
import { Link } from "@remix-run/react";
import { useCallback } from "react";

type CommentItemProps = Pick<
  ProfileComment,
  "id" | "profile" | "text" | "createdAt" | "likes" | "_count"
>;

const CommentItem = ({ id: postId, profile, text, createdAt, likes, _count }: CommentItemProps) => {
  const { user } = useSession();
  const isOwner = user?.id === profile.id;
  const hasLiked = user ? likes.includes(user.id) : false;
  const dispatch = useAppDispatch();

  const onReaction = useCallback(
    (data: any) => {
      dispatch(updateComment(data.data.post));
    },
    [dispatch]
  );

  return (
    <Link to={`/profile/${profile.username}/post/${postId}`}>
      <div className="flex gap-x-3">
        <CldAvatar avatar={profile.avatar} name={profile.name} />
        <div className="w-full flex flex-col space-y-2">
          <div className="py-1 flex-between gap-3">
            <div className="text-sm flex-center gap-3">
              <UsernameButton username={profile.username} />
              <p className="text-muted-foreground">{postDateFormat(createdAt)}</p>
            </div>
            <PostDropdown isOwner={isOwner} postId={postId} />
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <p className="text-foreground">{text}</p>
          </div>
          <div className="mt-2 -ml-3 flex items-center">
            <LikeButton
              postId={postId}
              postOwnerUsername={profile.username}
              hasLiked={hasLiked}
              count={_count.likes}
              onAction={onReaction}
            />
            <CommentButton
              parentId={postId}
              postOwnerUsername={profile.username}
              count={_count.comments}
              onAction={onReaction}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CommentItem;
