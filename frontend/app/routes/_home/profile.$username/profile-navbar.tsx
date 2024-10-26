import { Button } from "@/components/ui/button";
import { NavLink } from "@remix-run/react";

export default function ProfileNavbar({ username }: { username: string }) {
  return (
    <div className="grid grid-cols-2 gap-4 border-b border-muted">
      <NavItem to={`/profile/${username}`} label="Posts" />
      <NavItem to={`/profile/${username}/comments`} label="Comments" />
    </div>
  );
}

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => {
      return isActive ? "border-b-2 border-muted-foreground" : "";
    }}
    end
  >
    <Button variant="ghost" className="!h-fit md:py-3 w-full text-base md:text-xl rounded-xl">
      {label}
    </Button>
  </NavLink>
);
