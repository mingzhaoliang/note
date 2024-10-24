import { cn } from "@/lib/utils/cn";
import { useRootContext } from "@/store/context/root.context";
import { cloudinaryLoader, Image, ImageProps } from "@udisc/remix-image";

export type CldImageProps = Omit<ImageProps, "loader" | "loaderUrl" | "unoptimized"> & {
  shimmer?: [number, number];
};

export default function CldImage({ src, className, options, shimmer, ...props }: CldImageProps) {
  const { CLOUDINARY_CLOUD_NAME } = useRootContext();

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <Image
        loaderUrl={`http://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/`}
        loader={cloudinaryLoader}
        src={src}
        options={{ background: undefined, ...options }}
        className="object-cover !min-w-full !min-h-full w-full h-full"
        {...props}
      />
    </div>
  );
}
