import { Link } from "@remix-run/react";
import { ChevronRightIcon } from "lucide-react";
import { GoogleG } from "../icons";
import { Button } from "../ui/button";

export default function GoogleButton() {
  return (
    <Button type="button" variant="outline" className="h-fit min-h-14" asChild>
      <Link to="/login/google" className="flex items-center justify-between">
        <GoogleG className="w-9 h-9" />
        <p className="text-wrap">Continue with Google</p>
        <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
      </Link>
    </Button>
  );
}
