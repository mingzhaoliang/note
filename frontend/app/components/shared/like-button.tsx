import { Like, LikeFilled } from "@/components/icons";
import { OnRevalidate, useRevalidatePost } from "@/hooks/use-revalidate-post";
import { useFetcher } from "@remix-run/react";
import { Button } from "../ui/button";

type PostLikesProps = {
  id: string;
  hasLiked: boolean;
  count: number;
  onRevalidate: OnRevalidate;
};

const LikeButton = ({ id, hasLiked, count, onRevalidate }: PostLikesProps) => {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";
  const Icon = (isSubmitting ? !hasLiked : hasLiked) ? LikeFilled : Like;
  const optimisticCount = isSubmitting ? (hasLiked ? count - 1 : count + 1) : count;

  useRevalidatePost(fetcher, onRevalidate);

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
