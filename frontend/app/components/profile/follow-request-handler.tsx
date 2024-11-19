import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { action } from "@/routes/_home/profile/$username/_layout";
import { useSession } from "@/store/context/session.context";
import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect } from "react";
import { Button } from "../ui/button";

type RequestHandlerProps = {
  requestingProfileId: string;
  onConfirmSuccess?: (data: any) => void;
  onDeclineSuccess?: () => void;
};

const FollowRequestHandler = ({
  requestingProfileId,
  onConfirmSuccess,
  onDeclineSuccess,
}: RequestHandlerProps) => {
  const { user } = useSession();
  const username = user?.username;
  const { toast } = useToast();
  const fetcher = useFetcher<typeof action>();

  const handleDecline = useCallback(() => {
    fetcher.submit(
      { _action: "decline-request", profileId: requestingProfileId },
      { method: "PUT", action: `/profile/${username}` }
    );
  }, [fetcher.submit, requestingProfileId, username]);

  const handleConfirm = useCallback(() => {
    fetcher.submit(
      { _action: "confirm-request", profileId: requestingProfileId },
      { method: "PUT", action: `/profile/${username}` }
    );
  }, [fetcher.submit, requestingProfileId, username]);

  useEffect(() => {
    if (!fetcher.data || fetcher.state !== "idle") return;

    const { _action, message, data } = fetcher.data;

    if (message) {
      toast({ variant: "primary", title: message });
    } else {
      if (_action === "confirm-request") {
        onConfirmSuccess?.(data);
      } else {
        onDeclineSuccess?.();
      }
    }
  }, [fetcher.data, fetcher.state, onConfirmSuccess, onDeclineSuccess, toast]);

  return (
    <div className={cn("flex items-center gap-x-2", fetcher.state !== "idle" && "hidden")}>
      <Button variant="outline" size="sm" onClick={handleDecline}>
        Decline
      </Button>
      <Button size="sm" onClick={handleConfirm}>
        Confirm
      </Button>
    </div>
  );
};

export default FollowRequestHandler;
