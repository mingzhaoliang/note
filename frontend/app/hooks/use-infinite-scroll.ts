import { PostOverview } from "@/types";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

type UseInfiniteScrollProps<T extends PostOverview> = {
  loaderRoute: string;
  inView: boolean;
  onLoad: (posts: T[]) => void;
};

const useInfiniteScroll = <T extends PostOverview>({
  loaderRoute,
  inView,
  onLoad,
}: UseInfiniteScrollProps<T>) => {
  const fetcher = useFetcher<{ posts: any }>();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!inView || !hasMore) return;
    fetcher.load(loaderRoute);
  }, [inView, hasMore]);

  useEffect(() => {
    if (!fetcher.data) return;
    onLoad(fetcher.data.posts);
    const hasMorePosts = fetcher.data.posts?.length > 0;
    setHasMore(hasMorePosts);
  }, [fetcher.data, onLoad]);

  return { hasMore };
};

export { useInfiniteScroll };
