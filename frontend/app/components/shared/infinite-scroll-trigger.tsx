import { useInView } from "@/hooks/use-in-view";
import { OnLoad, useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { cn } from "@/lib/utils/cn";
import { Slot } from "@radix-ui/react-slot";
import { Loader2Icon } from "lucide-react";

type InfiniteScrollTriggerProps<T> = {
  loaderRoute: string;
  onLoad: OnLoad<T>;
  className?: string;
  loaderComponent?: React.ReactNode;
};

export default function InfiniteScrollTrigger<T>({
  loaderRoute,
  onLoad,
  className,
  loaderComponent,
}: InfiniteScrollTriggerProps<T>) {
  const [targetRef, inView] = useInView();

  const { hasMore, state } = useInfiniteScroll({ loaderRoute, inView, onLoad });

  return (
    <div
      ref={targetRef}
      className={cn(
        "w-full flex-center transition-all duration-500",
        className,
        hasMore ? "scale-y-100" : "scale-y-0 p-0 m-0"
      )}
    >
      {hasMore && (
        <Slot
          className={cn("transition-all", inView || state !== "idle" ? "opacity-100" : "opacity-0")}
        >
          {loaderComponent ?? <Loader2Icon className="w-6 h-6 animate-spin" />}
        </Slot>
      )}
    </div>
  );
}
