import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { useFetcher } from "@remix-run/react";

type DeletePostFormProps = {
  postId: string;
  onDelete?: () => void;
};

export default function DeletePostForm({ postId, onDelete }: DeletePostFormProps) {
  const fetcher = useFetcher({ key: "post" });

  const onSubmit = () => {
    if (onDelete) onDelete();
  };

  return (
    <fetcher.Form method="DELETE" action={`/api/post/${postId}/delete`} onSubmit={onSubmit}>
      <input type="hidden" name="postId" value={postId} />
      <AlertDialogAction type="submit" onClick={(e) => e.stopPropagation()}>
        Continue
      </AlertDialogAction>
    </fetcher.Form>
  );
}
