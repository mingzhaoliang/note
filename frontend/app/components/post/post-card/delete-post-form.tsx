import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { useFeed } from "@/store/feed.context";
import { useFetcher } from "@remix-run/react";

type DeletePostFormProps = {
  postId: string;
};

export default function DeletePostForm({ postId }: DeletePostFormProps) {
  const fetcher = useFetcher();
  const { setPosts } = useFeed();

  const onSubmit = () => {
    setPosts((draft) => {
      const targetPostIndex = draft.findIndex((post) => post.id === postId);
      draft.splice(targetPostIndex, 1);
    });
  };

  return (
    <fetcher.Form method="POST" action="/?index" onSubmit={onSubmit}>
      <input type="hidden" name="postId" value={postId} />
      <AlertDialogAction type="submit" name="_action" value="delete">
        Continue
      </AlertDialogAction>
    </fetcher.Form>
  );
}
