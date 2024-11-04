import { cn } from "@/lib/utils/cn";
import { NavLink } from "@remix-run/react";
import { forwardRef } from "react";

const NavTabItem = forwardRef<
  React.ElementRef<typeof NavLink>,
  React.ComponentPropsWithoutRef<typeof NavLink>
>(({ to, end = true, className, ...props }, ref) => (
  <NavLink
    ref={ref}
    to={to}
    className={({ isActive }) =>
      cn(
        "flex-1 flex-center px-4 py-2 md:py-3 font-medium md:text-lg",
        isActive ? "border-b-2 border-muted-foreground" : "text-primary/40",
        className
      )
    }
    end={end}
    {...props}
  />
));

const NavTab = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full flex border-b border-muted", className)} {...props} />
    );
  }
);

export { NavTab, NavTabItem };
