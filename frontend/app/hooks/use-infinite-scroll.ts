import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

export type OnLoad<T> = (data: T) => void;

type UseInfiniteScrollProps<T> = {
  loaderRoute: string;
  inView: boolean;
  onLoad: OnLoad<T>;
};

const useInfiniteScroll = <T>({ loaderRoute, inView, onLoad }: UseInfiniteScrollProps<T>) => {
  const fetcher = useFetcher<T & { remaining: number }>();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!inView || !hasMore) return;
    fetcher.load(loaderRoute);
  }, [inView, hasMore]);

  useEffect(() => {
    if (!fetcher.data) return;
    setHasMore(fetcher.data.remaining > 0);
    onLoad(fetcher.data as T);
  }, [JSON.stringify(fetcher.data), onLoad]);

  return { hasMore, state: fetcher.state };
};

export { useInfiniteScroll };
