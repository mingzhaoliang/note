import NavTab from "@/components/ui/nav-tab";

export default function ProfileNavbar({ username }: { username: string }) {
  return (
    <div className="grid grid-cols-2 gap-4 border-b border-muted">
      <NavTab to={`/profile/${username}`} label="Posts" />
      <NavTab to={`/profile/${username}/comments`} label="Comments" />
    </div>
  );
}
