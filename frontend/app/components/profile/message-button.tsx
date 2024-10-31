import { Button } from "@/components/ui/button";
import { useFetcher } from "@remix-run/react";
import { MessageCircleIcon } from "lucide-react";

type MessageButtonProps = {
  profileId: string;
};

const MessageButton = ({ profileId }: MessageButtonProps) => {
  const fetcher = useFetcher();

  const handleClick = () => {
    fetcher.submit({ recipientId: profileId }, { method: "POST", action: `/message?index` });
  };

  return (
    <Button variant="outline" size="sm" className="space-x-2 rounded-xl" onClick={handleClick}>
      <p>Message</p>
      <MessageCircleIcon className="w-4 h-4" />
    </Button>
  );
};

export default MessageButton;
