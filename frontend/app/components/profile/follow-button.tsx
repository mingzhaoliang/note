import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { action } from "@/routes/_home/profile.$username/_layout";
import { Slot } from "@radix-ui/react-slot";
import { useFetcher } from "@remix-run/react";
import { UserRoundMinusIcon, UserRoundPlusIcon } from "lucide-react";
import { useEffect } from "react";

type FollowButtonProps = {
  isFollowing: boolean;
  username: string;
  usernameToFollow: string;
};

const FollowButton = ({ isFollowing, username, usernameToFollow }: FollowButtonProps) => {
  const { toast } = useToast();
  const fetcher = useFetcher<typeof action>();
  const isSubmitting = fetcher.state !== "idle";
  const optimisticIsFollowing = isSubmitting ? !isFollowing : isFollowing;

  const handleClick = () => {
    fetcher.submit(
      { _action: "follow", usernameToFollow },
      { method: "PUT", action: `/profile/${username}` }
    );
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
      className="space-x-2 rounded-xl"
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
