import { Post } from "@/types";
import { FetcherWithComponents } from "@remix-run/react";
import { useEffect } from "react";
import { useToast } from "./use-toast";

type ActionState = {
  message: string;
  _action: string;
  postId: string;
};

type OnRevalidate = (updatedPost: Post | undefined, actionState: ActionState) => void;

const useRevalidatePost = (fetcher: FetcherWithComponents<unknown>, onRevalidate: OnRevalidate) => {
  const { toast } = useToast();

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (!fetcher.data) return;
    const { post, actionState } = fetcher.data as {
      post: Post | undefined;
      actionState: ActionState;
    };
    if (actionState.message) {
      toast({
        variant: "primary",
        title: actionState.message,
      });
    }

    onRevalidate(post, actionState);
  }, [fetcher.state, fetcher.data]);
};

export { useRevalidatePost, type OnRevalidate };
