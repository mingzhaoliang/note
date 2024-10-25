import { requireUser } from "@/session/guard.server";
import { SessionProvider } from "@/store/session.context";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, useLoaderData } from "@remix-run/react";
import MobileHeader from "./mobile-header";
import Sidebar from "./sidebar";

export async function loader({ request }: LoaderFunctionArgs) {
  const { authHeader, user } = await requireUser(request);
  return json({ user }, { headers: authHeader ? { "Set-Cookie": authHeader } : undefined });
}

export default function HomeLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <SessionProvider user={user}>
      <div className="h-full min-h-screen md:pl-20 md:flex">
        <MobileHeader />
        <Outlet />
        <Sidebar />
      </div>
    </SessionProvider>
  );
}
