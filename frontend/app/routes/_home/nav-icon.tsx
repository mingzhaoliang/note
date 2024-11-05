import { cn } from "@/lib/utils/cn";

type NavIconProps = {
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  className?: string;
  still?: boolean;
};

export default function NavIcon({ Icon, className, still }: NavIconProps) {
  return (
    <div className={cn("relative group w-full h-14 md:w-16 md:h-16 flex-center")}>
      <Icon className={cn("z-10 text-muted-foreground", className)} />
      <div className="absolute inset-0 md:py-1.5 flex-center">
        <div
          className={cn(
            "relative w-full max-md:max-w-20 h-full rounded-xl",
            still
              ? "scale-75 w-fit aspect-square rounded-full bg-secondary group-hover:w-full group-hover:rounded-xl group-hover:scale-100 transition-transform duration-100"
              : "scale-90 group-hover:bg-secondary group-hover:scale-100 transition-transform duration-100"
          )}
        />
      </div>
    </div>
  );
}
