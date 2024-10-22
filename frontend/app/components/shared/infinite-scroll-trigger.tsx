import { useInView } from "@/hooks/use-in-view";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { cn } from "@/lib/utils/cn";
import { Loader2Icon } from "lucide-react";
import { Updater } from "use-immer";

type InfiniteScrollTriggerProps = {
  loaderRoute: string;
  setPosts: Updater<any[]>;
  className?: string;
};

export default function InfiniteScrollTrigger({
  loaderRoute,
  setPosts,
  className,
}: InfiniteScrollTriggerProps) {
  const [targetRef, inView] = useInView();

  const { hasMore } = useInfiniteScroll({ loaderRoute, inView, setPosts });

  return (
    <div ref={targetRef} className={cn("w-full flex-center", className)}>
      {hasMore && <Loader2Icon className="w-6 h-6 animate-spin" />}
    </div>
  );
}
