import { Button } from "@/components/ui/button";
import { NavLink } from "@remix-run/react";

const navLinks = [
  {
    to: "/profile",
    label: "Posts",
  },
  {
    to: "/profile/comments",
    label: "Comments",
  },
  {
    to: "/profile/liked",
    label: "Liked",
  },
];

export default function ProfileNavbar() {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-muted">
      {navLinks.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => {
            return isActive ? "border-b-2 border-muted-foreground" : "";
          }}
        >
          <Button variant="ghost" className="!h-fit md:py-3 w-full text-base md:text-xl">
            {label}
          </Button>
        </NavLink>
      ))}
    </div>
  );
}
