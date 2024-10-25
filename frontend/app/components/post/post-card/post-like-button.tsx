import { Like, LikeFilled } from "@/components/icons";
import { OnRevalidate, useRevalidatePost } from "@/hooks/use-revalidate-post";
import { RevalidatePostStats } from "@/store/redux/features/post-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect } from "react";

type PostLikesProps = {
  postId: string;
  hasLiked: boolean;
  count: number;
};

const PostLikeButton = ({ postId, hasLiked, count }: PostLikesProps) => {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.formData?.get("postId") === postId;
  const Icon = (isSubmitting ? !hasLiked : hasLiked) ? LikeFilled : Like;
  const optimisticCount = isSubmitting ? (hasLiked ? count - 1 : count + 1) : count;
  const dispatch = useAppDispatch();

  const handleRevalidate: OnRevalidate = useCallback((updatedPost, actionState) => {
    if (!updatedPost) return;
    dispatch(RevalidatePostStats({ updatedPost, postId: actionState.postId }));
  }, []);

  useRevalidatePost(fetcher, handleRevalidate);

  return (
    <div className="flex items-center space-x-2">
      <fetcher.Form method="PUT" action="/post/like" className="flex-center">
        <input type="hidden" name="postId" value={postId} />
        <button type="submit" name="_action" value="like">
        <button type="submit" name="_action" value="like" onClick={(e) => e.stopPropagation()}>
          <Icon className="text-inactive w-5 h-5" />
        </button>
      </fetcher.Form>
      <div className="min-w-3">
        {optimisticCount > 0 && <p className="text-inactive text-sm">{optimisticCount}</p>}
      </div>
    </div>
  );
};

export default PostLikeButton;
