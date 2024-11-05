import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { useSession } from "@/store/context/session.context";
import { removeFollowerRequest, setFollowers } from "@/store/redux/features/relationship-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect } from "react";
import { Button } from "../ui/button";

type RequestHandlerProps = {
  requestingProfileId: string;
};

const FollowRequestHandler = ({ requestingProfileId }: RequestHandlerProps) => {
  const { user } = useSession();
  const username = user?.username;
  const { toast } = useToast();
  const fetcher = useFetcher<any>();
  const dispatch = useAppDispatch();

  const handleDecline = useCallback(() => {
    fetcher.submit(
      { _action: "declineRequest", profileId: requestingProfileId },
      { method: "PUT", action: `/profile/${username}` }
    );
  }, [fetcher.submit, requestingProfileId, username]);

  const handleConfirm = useCallback(() => {
    fetcher.submit(
      { _action: "confirmRequest", profileId: requestingProfileId },
      { method: "PUT", action: `/profile/${username}` }
    );
  }, [fetcher.submit, requestingProfileId, username]);

  useEffect(() => {
    if (!fetcher.data || fetcher.state !== "idle") return;

    const { actionState, data } = fetcher.data;

    if (actionState.message) {
      toast({ variant: "primary", title: actionState.message });
    } else {
      if (actionState._action === "confirmRequest") {
        dispatch(
          setFollowers([
            {
              id: data.from.id,
              status: data.status,
              profile: data.from,
            },
          ])
        );
      }
      dispatch(removeFollowerRequest(requestingProfileId));
    }
  }, [fetcher.data, fetcher.state, dispatch]);

  return (
    <div className={cn("flex items-center gap-x-2", fetcher.state !== "idle" && "hidden")}>
      <Button variant="outline" size="sm" className="space-x-2 rounded-xl" onClick={handleDecline}>
        Decline
      </Button>
      <Button size="sm" className="space-x-2 rounded-xl" onClick={handleConfirm}>
        Confirm
      </Button>
    </div>
  );
};

export default FollowRequestHandler;
