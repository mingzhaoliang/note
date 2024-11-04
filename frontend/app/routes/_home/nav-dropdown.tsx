import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, Link } from "@remix-run/react";
import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";

type NavDropdownProps = {
  triggerIcon: React.ReactNode;
};

export default function NavDropdown({ triggerIcon }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const matches = useMediaQuery("(min-width: 768px)");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-primary/50 hover:text-primary hover:bg-transparent"
        >
          {triggerIcon}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={matches ? "start" : "end"}
        className="w-60 p-2 font-medium bg-primary-foreground"
      >
        <DropdownMenuItem
          className="p-3"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <Link to="/settings/privacy" className="w-full h-full">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-3" asChild>
          <Form method="post" action="/logout">
            <button type="submit" className="w-full h-full flex-start">
              Log out
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
