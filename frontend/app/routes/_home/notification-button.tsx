import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { NavLink } from "@remix-run/react";
import { BellIcon } from "lucide-react";

const NotificationButton = () => {
  return (
    <Button variant="ghost" size="icon" className="rounded-full" asChild>
      <NavLink to="/notifications">
        {({ isActive }) => (
          <BellIcon className={cn(isActive ? "text-primary" : "text-muted-foreground")} />
        )}
      </NavLink>
    </Button>
  );
};

export default NotificationButton;
