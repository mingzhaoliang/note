import { requireUser } from "@/session/guard.server";
import { SessionProvider } from "@/store/context/session.context";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, useLoaderData } from "@remix-run/react";
import MobileHeader from "./mobile-header";
import Sidebar from "./sidebar";
import { SocketProvider } from "@/store/context/socket.context";

export async function loader({ request }: LoaderFunctionArgs) {
  const { authHeader, user } = await requireUser(request);
  return json({ user }, { headers: authHeader ? { "Set-Cookie": authHeader } : undefined });
}

export default function HomeLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <SessionProvider user={user}>
      <SocketProvider userId={user?.id}>
        <div className="h-full min-h-screen md:pl-20 flex flex-col md:flex-row">
          <MobileHeader />
          <div className="flex-1">
            <Outlet />
          </div>
          <Sidebar />
        </div>
      </SocketProvider>
    </SessionProvider>
  );
}
