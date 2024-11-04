import Mark from "@/components/shared/mark";
import { Button } from "@/components/ui/button";
import { useSession } from "@/store/context/session.context";
import { Link } from "@remix-run/react";
import { AlignRightIcon, LogInIcon } from "lucide-react";
import NavDropdown from "./nav-dropdown";
import NotificationButton from "./notification-button";

export default function MobileHeader() {
  const { user } = useSession();

  return (
    <section className="blur-background header-mobile">
      <div className="flex-between px-5 py-4">
        <Link to="/">
          <Mark />
        </Link>
        {user && (
          <div className="flex items-center gap-x-2">
            <NotificationButton />
            <NavDropdown triggerIcon={<AlignRightIcon />} />
          </div>
        )}
        {!user && (
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
