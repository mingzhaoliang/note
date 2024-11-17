import { Like, LikeFilled } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { action } from "@/routes/_home/profile/$username_.post/$postId";
import { useSession } from "@/store/context/session.context";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import LoginModal from "../auth/login-modal";
import { Button } from "../ui/button";

type PostLikesProps = {
  postId: string;
  postOwnerUsername: string;
  hasLiked: boolean;
  count: number;
  onAction?: (data: any) => void;
};

const LikeButton = ({ postId, postOwnerUsername, hasLiked, count, onAction }: PostLikesProps) => {
  const { user } = useSession();
  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <LoginModal>
          <Like className="text-inactive w-5 h-5">{count}</Like>
        </LoginModal>
        <div className="min-w-3">
          {count > 0 && <p className="text-inactive text-sm">{count}</p>}
        </div>
      </div>
    );
  }

  const fetcher = useFetcher<typeof action>();
  const isSubmitting = fetcher.state !== "idle";
  const Icon = (isSubmitting ? !hasLiked : hasLiked) ? LikeFilled : Like;
  const optimisticCount = isSubmitting ? (hasLiked ? count - 1 : count + 1) : count;
  const { toast } = useToast();

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    fetcher.submit(
      { _action: "like-unlike" },
      { method: "PUT", action: `/profile/${postOwnerUsername}/post/${postId}` }
    );
  };

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data || fetcher.data._action !== "like-unlike") {
      return;
    }

    if (fetcher.data.message) {
      toast({ variant: "primary", title: fetcher.data.message });
    } else {
      onAction?.(fetcher.data);
    }
  }, [fetcher.state, fetcher.data, toast]);

  return (
    <Button variant="ghost" className="rounded-full space-x-2 px-3" onClick={handleSubmit}>
      <Icon className="text-inactive w-5 h-5" />
      {optimisticCount > 0 && <p className="text-inactive text-sm">{optimisticCount}</p>}
    </Button>
  );
};

export default LikeButton;
