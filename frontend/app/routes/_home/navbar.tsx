import { Home, HomeFilled, Message, MessageFilled, Person, PersonFilled } from "@/components/icons";
import { PaletteIcon } from "lucide-react";
import CreatePostButton from "./create-post-button";
import NavItem from "./nav-item";

type NavbarProps = {
  isAuthenticated: boolean;
};

export default function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <nav className="max-md:navbar-mobile md:navbar">
      <NavItem to="/" DefaultIcon={Home} ActiveIcon={HomeFilled} />
      <NavItem to="/explore" DefaultIcon={PaletteIcon} />
      <CreatePostButton isAuthenticated={isAuthenticated} />
      <NavItem to="/message" DefaultIcon={Message} ActiveIcon={MessageFilled} />
      <NavItem to="/profile" DefaultIcon={Person} ActiveIcon={PersonFilled} />
    </nav>
  );
}
