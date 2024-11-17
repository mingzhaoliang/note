import { requireUser } from "@/session/guard.server";
import { SessionProvider } from "@/store/context/session.context";
import { SocketProvider } from "@/store/context/socket.context";
import { setFeeds } from "@/store/redux/features/feed-slice";
import { useAppStore } from "@/store/redux/hooks";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, useLoaderData, useMatches } from "@remix-run/react";
import { useRef } from "react";
import MobileHeader from "./mobile-header";
import Sidebar from "./sidebar";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, headers } = await requireUser(request);

  return json({ user }, { headers });
}

export default function HomeLayout() {
  const { user } = useLoaderData<typeof loader>();
  const initialised = useRef(false);
  const store = useAppStore();
  const matches = useMatches();

  matches.forEach((match: any) => {
    if (match.id === "routes/_home/_index/index") {
      if (!initialised.current) {
        initialised.current = true;
        store.dispatch(setFeeds(match.data.posts));
      }
    }
  });

  return (
    <SessionProvider user={user}>
      <SocketProvider userId={user?.id}>
        <div className="h-full min-h-screen md:pl-20 flex flex-col md:flex-row">
          <MobileHeader />
          <div className="flex-1 flex flex-col">
            <Outlet />
          </div>
          <Sidebar />
        </div>
      </SocketProvider>
    </SessionProvider>
  );
}
