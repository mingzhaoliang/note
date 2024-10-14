import { requireUser } from "@/session/guard.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, useLoaderData } from "@remix-run/react";
import MobileHeader from "./mobile-header";

export async function loader({ request }: LoaderFunctionArgs) {
  const { authHeader, user } = await requireUser(request);
  return json({ user }, { headers: authHeader ? { "Set-Cookie": authHeader } : undefined });
}

export default function HomeLayout() {
  const { user } = useLoaderData<typeof loader>();
  const isAuthenticated = user !== null;

  return (
    <div className="h-full min-h-screen">
      <MobileHeader isAuthenticated={isAuthenticated} />
      <Outlet />
    </div>
  );
}
