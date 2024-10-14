import Mark from "@/components/common/mark";
import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";
import { AlignRightIcon, LogInIcon } from "lucide-react";
import NavDropdown from "./nav-dropdown";

type MobileHeaderProps = {
  isAuthenticated: boolean;
};

export default function MobileHeader({ isAuthenticated }: MobileHeaderProps) {
  return (
    <section className="header-mobile">
      <div className="flex-between px-5 py-4">
        <Link to="/">
          <Mark />
        </Link>

        {isAuthenticated && <NavDropdown triggerIcon={<AlignRightIcon />} />}

        {!isAuthenticated && (
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link to="/login">
              <LogInIcon className="w-5 h-5" />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
