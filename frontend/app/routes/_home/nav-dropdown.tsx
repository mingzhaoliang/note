import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slot } from "@radix-ui/react-slot";
import { Form } from "@remix-run/react";

type NavDropdownProps = {
  triggerIcon: React.ReactNode;
};

export default function NavDropdown({ triggerIcon }: NavDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-inactive hover:text-primary hover:bg-transparent"
        >
          <Slot className="w-6 h-6">{triggerIcon}</Slot>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60 p-2 font-medium">
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
