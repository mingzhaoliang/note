import { Link, useLocation } from "@remix-run/react";
import { PlusIcon } from "lucide-react";
import NavIcon from "./nav-icon";

export default function CreatePostButton() {
  const location = useLocation();

  return (
    <Link to="/create" state={{ referrer: location.pathname }}>
      <NavIcon
        Icon={PlusIcon}
        className="text-muted-foreground group-hover:text-primary hover:bg-secondary"
        still
      />
    </Link>
  );
}
