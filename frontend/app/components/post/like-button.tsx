import { Like, LikeFilled } from "@/components/icons";
import { OnRevalidate, useRevalidatePost } from "@/hooks/use-revalidate-post";
import { RevalidatePostStats } from "@/store/redux/features/post-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import { useFetcher } from "@remix-run/react";
import { useCallback } from "react";

type PostLikesProps = {
  id: string;
  hasLiked: boolean;
  count: number;
  type: "post" | "comment";
};

const LikeButton = ({ id, hasLiked, count, type }: PostLikesProps) => {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";
  const Icon = (isSubmitting ? !hasLiked : hasLiked) ? LikeFilled : Like;
  const optimisticCount = isSubmitting ? (hasLiked ? count - 1 : count + 1) : count;
  const dispatch = useAppDispatch();

  const handleRevalidate: OnRevalidate = useCallback((updatedPost, actionState) => {
    if (!updatedPost || type !== "post") return;
    dispatch(RevalidatePostStats({ updatedPost, postId: actionState.postId }));
  }, []);

  useRevalidatePost(fetcher, handleRevalidate);

  return (
    <div className="flex items-center space-x-2">
      <fetcher.Form method="PUT" action={`/api/${type}/${id}/like`} className="flex-center">
        <button type="submit" onClick={(e) => e.stopPropagation()}>
          <Icon className="text-inactive w-5 h-5" />
        </button>
      </fetcher.Form>
      <div className="min-w-3">
        {optimisticCount > 0 && <p className="text-inactive text-sm">{optimisticCount}</p>}
      </div>
    </div>
  );
};

export default LikeButton;
