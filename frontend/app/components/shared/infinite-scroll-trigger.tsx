import { useInView } from "@/hooks/use-in-view";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { cn } from "@/lib/utils/cn";
import { Post, PostOverview } from "@/types";
import { Loader2Icon } from "lucide-react";

type InfiniteScrollTriggerProps<T> = {
  loaderRoute: string;
  onLoad: (posts: T[]) => void;
  className?: string;
};

export default function InfiniteScrollTrigger<T>({
  loaderRoute,
  onLoad,
  className,
}: InfiniteScrollTriggerProps<T>) {
  const [targetRef, inView] = useInView();

  const { hasMore } = useInfiniteScroll({ loaderRoute, inView, onLoad });

  return (
    <div ref={targetRef} className={cn("w-full flex-center", className)}>
      {hasMore && <Loader2Icon className="w-6 h-6 animate-spin" />}
    </div>
  );
}
