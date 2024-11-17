import PostImages from "@/components/post/post-card/post-images";
import CldAvatar from "@/components/shared/cld-avatar";
import CommentButton from "@/components/shared/comment-button";
import LikeButton from "@/components/shared/like-button";
import TagButton from "@/components/shared/tag-button";
import UsernameButton from "@/components/shared/username-button";
import { postDateFormat } from "@/lib/utils/formatter";
import { useSession } from "@/store/context/session.context";
import { updateCommentParent } from "@/store/redux/features/profile-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import { ProfileComment } from "@/types";
import { Link } from "@remix-run/react";
import { useCallback } from "react";

type CommentParentProps = ProfileComment["parent"];

const CommentParent = ({
  id,
  text,
  profile,
  images,
  createdAt,
  tags,
  likes,
  _count,
  parent,
}: CommentParentProps) => {
  const { user } = useSession();
  const hasLiked = user ? likes.includes(user.id) : false;
  const dispatch = useAppDispatch();

  const onReaction = useCallback(
    (data: any) => {
      dispatch(updateCommentParent(data.data.post));
    },
    [dispatch]
  );

  return (
    <Link to={`/profile/${profile.username}/post/${id}`}>
      <div className="w-full flex space-x-3">
        <div className="flex-center flex-col">
          <CldAvatar avatar={profile.avatar} name={profile.name} />
          <div className="flex-1 border-l-2 my-2 border-muted" />
        </div>
        <div className="w-full flex flex-col space-y-2">
          <div className="py-1 gap-3">
            <div className="text-sm flex items-center gap-3">
              <UsernameButton username={profile.username} />
              <p className="text-muted-foreground">{postDateFormat(createdAt)}</p>
            </div>
            {parent && (
              <p className="text-sm text-muted-foreground">
                Replying to <UsernameButton username={parent.profile.username} />
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
            <LikeButton
              postId={id}
              postOwnerUsername={profile.username}
              hasLiked={hasLiked}
              count={_count.likes}
              onAction={onReaction}
            />
            <CommentButton
              parentId={id}
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

export default CommentParent;
