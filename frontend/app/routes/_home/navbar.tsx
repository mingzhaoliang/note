import { Home, HomeFilled, Message, MessageFilled, Person, PersonFilled } from "@/components/icons";
import { PaletteIcon } from "lucide-react";
import CreatePostButton from "./create-post-button";
import NavItem from "./nav-item";

export default function Navbar() {
  return (
    <nav className="max-md:navbar-mobile md:navbar">
      <NavItem to="/" DefaultIcon={Home} ActiveIcon={HomeFilled} />
      <NavItem to="/explore" DefaultIcon={PaletteIcon} />
      <CreatePostButton />
      <NavItem to="/message" DefaultIcon={Message} ActiveIcon={MessageFilled} />
      <NavItem to="/profile" DefaultIcon={Person} ActiveIcon={PersonFilled} />
    </nav>
  );
}
