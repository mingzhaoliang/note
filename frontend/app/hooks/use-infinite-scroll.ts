import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Updater } from "use-immer";

type UseInfiniteScrollProps<T extends { id: string }> = {
  loaderRoute: string;
  inView: boolean;
  setPosts: Updater<T[]>;
};

const useInfiniteScroll = <T extends { id: string }>({
  loaderRoute,
  inView,
  setPosts,
}: UseInfiniteScrollProps<T>) => {
  const fetcher = useFetcher<{ posts: any }>();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!inView || !hasMore) return;
    fetcher.load(loaderRoute);
  }, [inView, hasMore]);

  useEffect(() => {
    if (!fetcher.data) return;

    setPosts((draft) => {
      if (!fetcher.data) return;
      fetcher.data.posts?.forEach((post: any) => {
        if (draft.findIndex((p) => p.id === post.id) === -1) {
          draft.push(post);
        }
      });
    });

    const hasMorePosts = fetcher.data.posts?.length > 0;
    setHasMore(hasMorePosts);
  }, [fetcher.data]);

  return { hasMore };
};

export { useInfiniteScroll };
