import { Home, HomeFilled, Message, MessageFilled, Person, PersonFilled } from "@/components/icons";
import { useSession } from "@/store/context/session.context";
import { PaletteIcon } from "lucide-react";
import CreatePostButton from "./create-post-button";
import NavItem from "./nav-item";

export default function Navbar() {
  const { user } = useSession();

  return (
    <nav className="max-md:navbar-mobile md:navbar">
      <NavItem to="/" preventScrollReset DefaultIcon={Home} ActiveIcon={HomeFilled} />
      <NavItem to="/explore" DefaultIcon={PaletteIcon} />
      <CreatePostButton />
      <NavItem to="/message" DefaultIcon={Message} ActiveIcon={MessageFilled} isProtected />
      <NavItem
        to={`/profile/${user?.username}`}
        DefaultIcon={Person}
        ActiveIcon={PersonFilled}
        isProtected
        end
      />
    </nav>
  );
}
