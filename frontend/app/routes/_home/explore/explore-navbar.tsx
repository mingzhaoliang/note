import { NavTab, NavTabItem } from "@/components/ui/nav-tab";
import { useSearchParams } from "@remix-run/react";

const ExploreNavbar = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")!;

  return (
    <NavTab>
      <NavTabItem to={`posts?q=${query}`}>Posts</NavTabItem>
      <NavTabItem to={`users?q=${query}`}>Users</NavTabItem>
    </NavTab>
  );
};

export default ExploreNavbar;
