import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { deletePost } from "@/store/redux/features/post-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import { useFetcher } from "@remix-run/react";

type DeletePostFormProps = {
  postId: string;
};

export default function DeletePostForm({ postId }: DeletePostFormProps) {
  const fetcher = useFetcher();
  const dispatch = useAppDispatch();

  const onSubmit = () => {
    dispatch(deletePost({ postId }));
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
