import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { action } from "@/routes/_home/profile/$username_.post/$postId";
import { useSession } from "@/store/context/session.context";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

type DeletePostAlertContentProps = {
  postId: string;
  onDelete?: (id: string) => void;
};

export default function DeletePostAlertContent({ postId, onDelete }: DeletePostAlertContentProps) {
  const { user } = useSession();
  if (!user) return null;

  const fetcher = useFetcher<typeof action>();
  const { toast } = useToast();

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();

    fetcher.submit(
      { _action: "delete", postId },
      { method: "DELETE", action: `/profile/${user.username}/post/${postId}` }
    );
  };

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data || fetcher.data._action !== "delete") return;

    if (fetcher.data.message) {
      toast({
        variant: "primary",
        title: fetcher.data.message,
      });
    } else {
      toast({
        variant: "primary",
        title: "Post deleted",
      });

      onDelete?.(fetcher.data.data.id);
    }
  }, [fetcher.state, fetcher.data, onDelete, toast]);

  return (
    <AlertDialogContent
      overlayConfig={{ onClick: (e) => e.stopPropagation() }}
      onClick={(e) => e.stopPropagation()}
    >
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure to delete this post?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={fetcher.state !== "idle"}>Cancel</AlertDialogCancel>
        <AlertDialogAction disabled={fetcher.state !== "idle"} onClick={handleSubmit}>
          {fetcher.state !== "idle" ? "Deleting..." : "Delete"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
