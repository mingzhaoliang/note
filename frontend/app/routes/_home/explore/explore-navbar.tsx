import { NavTab, NavTabItem } from "@/components/ui/nav-tab";
import { useSearchParams } from "@remix-run/react";

const ExploreNavbar = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")!;

  return (
    <NavTab>
      <NavTabItem to={"/explore/posts?" + new URLSearchParams({ q: query })}>Posts</NavTabItem>
      <NavTabItem to={"/explore/users?" + new URLSearchParams({ q: query })}>Users</NavTabItem>
    </NavTab>
  );
};

export default ExploreNavbar;
