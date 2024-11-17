import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils/cn";
import { useFetcher } from "@remix-run/react";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";

type LoadMoreTriggerProps = {
  loaderComponent?: React.ReactNode;
  className?: string;
  nextPageUrl: string;
  hasMore: boolean;
  onLoad: (data: any) => void;
};

const LoadMoreTrigger = ({
  loaderComponent,
  className,
  nextPageUrl,
  hasMore,
  onLoad,
}: LoadMoreTriggerProps) => {
  const [targetRef, inView] = useInView({ root: null, rootMargin: "0px", threshold: 0.8 });
  const fetcher = useFetcher();

  useEffect(() => {
    if (!inView) return;
    fetcher.load(nextPageUrl);
  }, [inView, nextPageUrl, fetcher.load]);

  useEffect(() => {
    if (!fetcher.data || fetcher.state !== "idle") return;
    const data = fetcher.data as any;
    onLoad(data);
  }, [fetcher.data, fetcher.state, onLoad]);

  if (!hasMore) return null;

  return (
    <div
      ref={targetRef}
      className={cn("w-full flex-center transition-all duration-500", className)}
    >
      {loaderComponent ?? <LoaderIcon className="animate-spin text-inactive" />}
    </div>
  );
};

export default LoadMoreTrigger;
