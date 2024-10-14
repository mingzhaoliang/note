import { Home, HomeFilled, Message, MessageFilled, Person, PersonFilled } from "@/components/icons";
import { PaletteIcon, Plus } from "lucide-react";
import NavIcon from "./nav-icon";
import NavItem from "./nav-item";

export default function Navbar() {
  return (
    <nav className="max-md:navbar-mobile md:navbar">
      <NavItem to="/" DefaultIcon={Home} ActiveIcon={HomeFilled} />
      <NavItem to="/explore" DefaultIcon={PaletteIcon} />
      <NavIcon
        Icon={Plus}
        className="text-muted-foreground group-hover:text-primary hover:bg-secondary"
        still
      />
      <NavItem to="/message" DefaultIcon={Message} ActiveIcon={MessageFilled} />
      <NavItem to="/profile" DefaultIcon={Person} ActiveIcon={PersonFilled} />
    </nav>
  );
}
