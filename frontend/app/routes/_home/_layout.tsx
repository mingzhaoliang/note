import { requireUser } from "@/session/guard.server";
import { FeedProvider } from "@/store/feed.context";
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
  const isAuthenticated = user !== null;

  return (
    <SessionProvider user={user}>
      <FeedProvider>
        <div className="h-full min-h-screen md:pl-20 md:flex">
          <Sidebar isAuthenticated={isAuthenticated} />
          <MobileHeader isAuthenticated={isAuthenticated} />
          <Outlet />
        </div>
      </FeedProvider>
    </SessionProvider>
  );
}
