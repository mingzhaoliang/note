import { Button } from "@/components/ui/button";
import { NavLink } from "@remix-run/react";

const NavTab = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => {
      return isActive ? "border-b-2 border-muted-foreground" : "";
    }}
    end
  >
    <Button
      variant="ghost"
      className="!h-fit md:py-3 w-full text-base md:text-lg rounded-xl hover:bg-muted/40"
    >
      {label}
    </Button>
  </NavLink>
);

export default NavTab;
