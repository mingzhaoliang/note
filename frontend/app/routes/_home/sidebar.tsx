import Logo from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Slot } from "@radix-ui/react-slot";
import { Link } from "@remix-run/react";
import { AlignLeftIcon, LogInIcon } from "lucide-react";
import NavDropdown from "./nav-dropdown";
import Navbar from "./navbar";

type SidebarProps = {
  isAuthenticated: boolean;
};

export default function Sidebar({ isAuthenticated }: SidebarProps) {
  return (
    <nav className="sidebar">
      <Logo className="hidden md:block shrink-0 w-8 h-8 hover:scale-105 transition-transform" />
      <Navbar isAuthenticated={isAuthenticated} />
      <Slot className="hidden md:block">
        {isAuthenticated ? (
          <NavDropdown triggerIcon={<AlignLeftIcon />} />
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link to="/login">
              <LogInIcon className="w-5 h-5" />
            </Link>
          </Button>
        )}
      </Slot>
    </nav>
  );
}