import envConfig from "@/config/env.config.server";
import { ProfileOverview } from "@/types";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import ProfileInfo from "./profile-info";
import ProfileNavbar from "./profile-navbar";

export async function loader({ params }: LoaderFunctionArgs) {
  const { username } = params;
  const response = await fetch(`${envConfig.API_URL}/profile/overview/${username}`);

  if (!response.ok) {
    return redirect("/");
  }

  const { profile } = (await response.json()) as { profile: ProfileOverview };

  return json({ profile });
}

export default function ProfileLayout() {
  const { profile } = useLoaderData<typeof loader>();

  return (
    <div className="flex-1 flex flex-col max-w-screen-lg p-6 pb-16 md:p-12 mx-auto gap-8">
      <ProfileInfo profile={profile} />
      <div className="space-y-4 md:space-y-6">
        <ProfileNavbar />
        <Outlet />
      </div>
    </div>
  );
}
