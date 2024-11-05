import CldImage from "@/components/shared/cld-image";
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
  isLocal?: boolean;
};

export default function PostImages({ images, isLocal }: PostImagesProps) {
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
  }, [api, throttledHandleScroll]);

  return (
    <Carousel setApi={setApi} className="w-full">
      <CarouselContent>
        {images.map((url) => (
          <CarouselItem key={url}>
            <div className="w-full h-full aspect-[5/3] rounded-2xl overflow-hidden">
              {isLocal && <img src={url} alt="" className="w-full h-full object-cover" />}
              {!isLocal && (
                <CldImage
                  src={url}
                  alt=""
                  responsive={[
                    { size: { width: 250, height: 150 }, maxWidth: 768 },
                    { size: { width: 500, height: 300 }, maxWidth: 1024 },
                    { size: { width: 750, height: 450 }, maxWidth: 1440 },
                  ]}
                  dprVariants={[1, 3, 5]}
                  placeholder="blur"
                />
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
        <>
          <div className="absolute top-2 right-2 rounded-full bg-secondary/60 px-2 py-1 text-xs">
            {currentSnap} / {images.length}
          </div>
          <CarouselPrevious
            className="left-2"
            onClick={(e) => {
              e.preventDefault();
              api?.scrollPrev();
            }}
          />
          <CarouselNext
            className="right-2"
            onClick={(e) => {
              e.preventDefault();
              api?.scrollNext();
            }}
          />
        </>
      )}
    </Carousel>
  );
}
