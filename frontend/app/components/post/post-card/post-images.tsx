import CldImage from "@/components/common/cld-image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useThrottle } from "@/hooks/use-throttle";
import { Post } from "@/types";
import { useCallback, useEffect, useState } from "react";

type PostImagesProps = {
  images: Post["images"];
};

export default function PostImages({ images }: PostImagesProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSnap, setCurrentSnap] = useState(1);

  const handleScroll = useCallback(() => {
    if (!api) return;
    setCurrentSnap(api.selectedScrollSnap() + 1);
  }, [api]);

  const throttledHandleScroll = useThrottle(handleScroll, 300);

  useEffect(() => {
    if (!api) return;

    api.on("scroll", () => {
      throttledHandleScroll();
    });
  }, [api]);

  return (
    <Carousel setApi={setApi} className="w-full">
      <CarouselContent>
        {images.map((url) => (
          <CarouselItem key={url}>
            <div className="w-full h-full max-h-96 rounded-2xl overflow-hidden">
              <CldImage
                src={url}
                alt=""
                responsive={[
                  { size: { width: 310, height: 190 }, maxWidth: 768 },
                  { size: { width: 620, height: 380 } },
                ]}
                dprVariants={[1, 3, 5]}
                placeholder="blur"
                fill
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
        <>
          <div className="absolute top-2 right-2 rounded-full bg-secondary/60 px-2 py-1 text-xs">
            {currentSnap} / {images.length}
          </div>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </>
      )}
    </Carousel>
  );
}
