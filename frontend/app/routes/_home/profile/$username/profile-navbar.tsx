import { NavTab, NavTabItem } from "@/components/ui/nav-tab";

export default function ProfileNavbar({ username }: { username: string }) {
  return (
    <NavTab>
      <NavTabItem to={`/profile/${username}`}>Posts</NavTabItem>
      <NavTabItem to={`/profile/${username}/comments`}>Comments</NavTabItem>
    </NavTab>
  );
}
