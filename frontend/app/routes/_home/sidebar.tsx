import Logo from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/store/context/session.context";
import { Link } from "@remix-run/react";
import { AlignLeftIcon, LogInIcon } from "lucide-react";
import NavDropdown from "./nav-dropdown";
import Navbar from "./navbar";
import NotificationButton from "./notification-button";

export default function Sidebar() {
  const { user } = useSession();

  return (
    <div className="blur-background sidebar-mobile md:sidebar">
      <Logo className="hidden md:block shrink-0 w-8 h-8 hover:scale-105 transition-transform" />
      <Navbar />
      <div className="hidden md:flex-center md:flex-col md: gap-y-2">
        {user ? (
          <>
            <NotificationButton />
            <NavDropdown triggerIcon={<AlignLeftIcon />} />
          </>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link to="/login">
              <LogInIcon className="w-5 h-5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
