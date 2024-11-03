import { Input } from "@/components/ui/input";
import { Form, Outlet, useLocation, useSearchParams } from "@remix-run/react";
import { SearchIcon } from "lucide-react";
import ExploreNavbar from "./explore-navbar";

export default function ExploreLayout() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const { pathname } = useLocation();

  return (
    <div className="flex-1 flex flex-col items-center p-6 w-full md:max-w-2xl mx-auto">
      <Form
        className="mb-4 flex items-center gap-2 w-full bg-muted rounded-full px-4 py-2"
        method="GET"
        action={pathname === "/explore" ? "/explore/posts" : pathname}
      >
        <SearchIcon />
        <Input
          type="search"
          name="q"
          defaultValue={query || ""}
          placeholder="Search"
          className="masked-input no-highlight"
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
        />
      </Form>
      {query && <ExploreNavbar />}
      <Outlet key={query} />
    </div>
  );
}
