import { cn } from "@/lib/utils/cn";
import Image, { cloudinaryLoader, ImageProps } from "@udisc/remix-image";

type CldImageProps = Omit<ImageProps, "loader" | "loaderUrl" | "unoptimized"> & {
  fill?: boolean;
};

export default function CldImage({ fill, src, className, options, ...props }: CldImageProps) {
  return (
    <Image
      loaderUrl={`http://res.cloudinary.com/${window.ENV.CLOUDINARY_CLOUD_NAME}/`}
      loader={cloudinaryLoader}
      src={src}
      options={{ background: undefined, ...options }}
      className={cn("object-cover", fill && "!min-w-full !min-h-full w-full h-full", className)}
      {...props}
    />
  );
}
