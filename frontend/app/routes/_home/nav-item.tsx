import { cn } from "@/lib/utils/cn";
import { Link, NavLink } from "@remix-run/react";
import NavIcon from "./nav-icon";

interface SidebarItemProps extends React.ComponentPropsWithoutRef<typeof Link> {
  DefaultIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  ActiveIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}

export default function NavItem({
  DefaultIcon,
  ActiveIcon,
  to,
  className,
  ...props
}: SidebarItemProps) {
  return (
    <NavLink to={to} className="w-full flex-center" {...props}>
      {({ isActive }) => (
        <NavIcon
          Icon={isActive ? ActiveIcon || DefaultIcon : DefaultIcon}
          className={cn(isActive ? "text-primary" : "", className)}
        />
      )}
    </NavLink>
  );
}
