import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@remix-run/react";
import { AlignRightIcon } from "lucide-react";

export default function NavDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <AlignRightIcon className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 p-2 font-medium">
        <DropdownMenuItem className="p-3" asChild>
          <Link to="/logout">Log out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
