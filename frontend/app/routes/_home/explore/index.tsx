import { Input } from "@/components/ui/input";
import { Form, useSearchParams } from "@remix-run/react";
import { SearchIcon } from "lucide-react";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="flex-1 flex flex-col items-center p-6 w-full md:max-w-2xl mx-auto">
      <Form className="flex items-center gap-2 w-full bg-muted rounded-full px-4 py-2">
        <SearchIcon />
        <Input
          type="search"
          name="q"
          defaultValue={searchParams.get("q") || ""}
          placeholder="Search"
          className="masked-input"
        />
      </Form>
    </div>
  );
}
