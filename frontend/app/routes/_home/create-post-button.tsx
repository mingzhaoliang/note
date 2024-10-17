import { Link, redirect, useLocation } from "@remix-run/react";
import { PlusIcon } from "lucide-react";
import NavIcon from "./nav-icon";

type CreatePostButtonProps = {
  isAuthenticated: boolean;
};

export default function CreatePostButton({ isAuthenticated }: CreatePostButtonProps) {
  const location = useLocation();

  return (
    <Link to={isAuthenticated ? "/create" : "/login"} state={{ referrer: location.pathname }}>
      <NavIcon
        Icon={PlusIcon}
        className="text-muted-foreground group-hover:text-primary hover:bg-secondary"
        still
      />
    </Link>
  );
}
