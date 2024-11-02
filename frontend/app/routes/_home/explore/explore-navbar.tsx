import NavTab from "@/components/ui/nav-tab";
import { useSearchParams } from "@remix-run/react";

const ExploreNavbar = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")!;

  return (
    <div className="w-full grid grid-cols-2 gap-4 border-b border-muted">
      <NavTab to={`posts?q=${query}`} label="Posts" />
      <NavTab to={`users?q=${query}`} label="Users" />
    </div>
  );
};

export default ExploreNavbar;
