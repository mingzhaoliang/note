import CldAvatar from "@/components/shared/cld-avatar";
import { cn } from "@/lib/utils/cn";
import { Message as TMessage } from "@/types";
import { forwardRef } from "react";

type MessageProps = TMessage & {
  isOwner?: boolean;
  isLatest?: boolean;
};

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ isOwner = false, isLatest = false, text, sender, seen, seenAt, createdAt }, ref) => {
    return (
      <div ref={ref} className={cn("flex gap-x-3", isOwner && "flex-row-reverse")}>
        <CldAvatar avatar={sender.avatar} name={sender.name} width={120} height={120} />
        <div className={cn("flex flex-col gap-y-2", isOwner ? "items-end" : "items-start")}>
          <p
            className={cn(
              "max-w-xs rounded-xl px-4 py-2",
              isOwner ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            {text}
          </p>
          {isOwner && isLatest && (
            <p className="text-primary/40 text-xs">
              {`${seen ? "Seen" : "Sent"} ${new Date(seen ? seenAt! : createdAt).toLocaleTimeString(
                "en-AU",
                {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }
              )}`}
            </p>
          )}
        </div>
      </div>
    );
  }
);

export default Message;
