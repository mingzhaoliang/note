import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { action } from "@/routes/_home/profile.$username/_layout";
import { useSession } from "@/store/context/session.context";
import { BaseRelationship, Profile } from "@/types";
import { Slot } from "@radix-ui/react-slot";
import { useFetcher } from "@remix-run/react";
import { ClockIcon, UserRoundMinusIcon, UserRoundPlusIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import LoginModal from "../auth/login-modal";

type FollowButtonProps = {
  profile: Pick<Profile, "id" | "private">;
};

const buttonTexts = {
  FOLLOWING: "Unfollow",
  NOT_FOLLOWING: "Follow",
  REQUESTED: "Requested",
} as const;

const icons = {
  FOLLOWING: <UserRoundMinusIcon />,
  NOT_FOLLOWING: <UserRoundPlusIcon />,
  REQUESTED: <ClockIcon />,
} as const;

const statusToRelationship = (status: BaseRelationship["status"]) => {
  const map = {
    PENDING: "REQUESTED",
    CONFIRMED: "FOLLOWING",
  } as const;

  return status ? map[status] : "NOT_FOLLOWING";
};

const FollowButton = ({ profile }: FollowButtonProps) => {
  const { toast } = useToast();
  const fetcher = useFetcher<typeof action>();
  const isSubmitting = fetcher.state !== "idle";
  const { user } = useSession();

  if (!user) {
    return (
      <LoginModal asChild>
        <Button size="sm" className="space-x-2 rounded-xl">
          <p>Follow</p>
          <UserRoundPlusIcon className="w-4 h-4" />
        </Button>
      </LoginModal>
    );
  }

  const optimisticRelationships = useMemo(() => {
    return {
      FOLLOWING: "NOT_FOLLOWING",
      NOT_FOLLOWING: profile.private ? "REQUESTED" : "FOLLOWING",
      REQUESTED: "NOT_FOLLOWING",
    } as const;
  }, [profile.private]);

  const currentStatus = user.following.find(({ id }) => id === profile.id)?.status;
  const relationship = statusToRelationship(currentStatus);

  const optimisticRelationship = isSubmitting
    ? optimisticRelationships[relationship]
    : relationship;

  const handleClick = () => {
    fetcher.submit(
      { _action: "follow", toId: profile.id },
      { method: "PUT", action: `/profile/${user.username}` }
    );
  };

  useEffect(() => {
    if (!fetcher.data?.message) return;

    fetcher.data._action === "follow" && toast({ variant: "primary", title: fetcher.data.message });
  }, [fetcher.data, toast]);

  return (
    <Button
      variant={optimisticRelationship === "NOT_FOLLOWING" ? "default" : "outline"}
      size="sm"
      className="space-x-2 rounded-xl"
      onClick={handleClick}
    >
      <p>{buttonTexts[optimisticRelationship]}</p>
      <Slot className="w-4 h-4">{icons[optimisticRelationship]}</Slot>
    </Button>
  );
};

export default FollowButton;
