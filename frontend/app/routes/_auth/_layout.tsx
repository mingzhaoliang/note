import Mark from "@/components/common/mark";
import { Link, Outlet } from "@remix-run/react";

export default function AuthLayout() {
  return (
    <div className="w-screen h-screen pt-32 flex flex-col items-center">
      <Link to="/" className="-ml-4">
        <Mark />
      </Link>
      <Outlet />
    </div>
  );
}