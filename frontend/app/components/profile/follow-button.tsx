import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { action } from "@/routes/api+/profile+/$username+/follow";
import { Slot } from "@radix-ui/react-slot";
import { useFetcher } from "@remix-run/react";
import { UserRoundMinusIcon, UserRoundPlusIcon } from "lucide-react";
import { useEffect } from "react";

type FollowButtonProps = {
  isFollowing: boolean;
  username: string;
};

const FollowButton = ({ isFollowing, username }: FollowButtonProps) => {
  const { toast } = useToast();
  const fetcher = useFetcher<typeof action>();
  const isSubmitting = fetcher.state !== "idle";
  const optimisticIsFollowing = isSubmitting ? !isFollowing : isFollowing;

  const handleClick = () => {
    fetcher.submit(null, { method: "PUT", action: `/api/profile/${username}/follow` });
  };

  useEffect(() => {
    if (!fetcher.data?.actionState) return;

    toast({
      variant: "primary",
      title: fetcher.data.actionState.message,
    });
  }, [fetcher.data?.actionState]);

  return (
    <Button
      variant={optimisticIsFollowing ? "outline" : "default"}
      size="sm"
      className="ml-2 space-x-2 rounded-xl"
      onClick={handleClick}
    >
      <p>{optimisticIsFollowing ? "Unfollow" : "Follow"}</p>
      <Slot className="w-4 h-4">
        {optimisticIsFollowing ? <UserRoundMinusIcon /> : <UserRoundPlusIcon />}
      </Slot>
    </Button>
  );
};

export default FollowButton;
