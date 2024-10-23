import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { useFetcher } from "@remix-run/react";

type DeletePostFormProps = {
  postId: string;
};

export default function DeletePostForm({ postId }: DeletePostFormProps) {
  const fetcher = useFetcher({ key: "post" });

  return (
    <fetcher.Form method="DELETE" action="/post/delete">
      <input type="hidden" name="postId" value={postId} />
      <AlertDialogAction type="submit" name="_action" value="delete">
        Continue
      </AlertDialogAction>
    </fetcher.Form>
  );
}
