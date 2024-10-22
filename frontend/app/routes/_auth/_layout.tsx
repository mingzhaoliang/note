import Mark from "@/components/shared/mark";
import { Link, Outlet } from "@remix-run/react";

export default function AuthLayout() {
  return (
    <div className="w-screen h-screen pt-32 flex flex-col items-center">
      <Link to="/" className="-ml-4 mb-6">
        <Mark />
      </Link>
      <Outlet />
    </div>
  );
}
