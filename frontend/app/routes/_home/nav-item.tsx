import LoginModal from "@/components/auth/login-modal";
import { cn } from "@/lib/utils/cn";
import { useSession } from "@/store/context/session.context";
import { NavLink } from "@remix-run/react";
import NavIcon from "./nav-icon";

interface NavItemProps extends React.ComponentPropsWithoutRef<typeof NavLink> {
  DefaultIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  ActiveIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  isProtected?: boolean;
  className?: string;
}

export default function NavItem({
  DefaultIcon,
  ActiveIcon,
  to,
  className,
  isProtected,
  ...props
}: NavItemProps) {
  const { user } = useSession();
  return (
    <>
      {isProtected && !user ? (
        <LoginModal>
          <NavIcon Icon={DefaultIcon} className={className} />
        </LoginModal>
      ) : (
        <NavLink to={to} className="w-full flex-center" {...props}>
          {({ isActive }) => (
            <NavIcon
              Icon={isActive ? ActiveIcon || DefaultIcon : DefaultIcon}
              className={cn(isActive ? "text-primary" : "text-primary/50", className)}
            />
          )}
        </NavLink>
      )}
    </>
  );
}
