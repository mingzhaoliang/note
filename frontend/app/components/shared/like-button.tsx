import { Like, LikeFilled } from "@/components/icons";
import { OnRevalidate, useRevalidatePost } from "@/hooks/use-revalidate-post";
import { RevalidatePostStats } from "@/store/redux/features/post-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import { useFetcher } from "@remix-run/react";
import { useCallback } from "react";
import { Button } from "../ui/button";

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
    <fetcher.Form method="PUT" action={`/api/post/${id}/like`} className="flex-center">
      <Button
        variant="ghost"
        type="submit"
        className="rounded-full space-x-2 px-3"
        onClick={(e) => e.stopPropagation()}
      >
        <Icon className="text-inactive w-5 h-5" />
        {optimisticCount > 0 && <p className="text-inactive text-sm">{optimisticCount}</p>}
      </Button>
    </fetcher.Form>
  );
};

export default LikeButton;
