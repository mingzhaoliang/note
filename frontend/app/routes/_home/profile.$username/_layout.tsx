import envConfig from "@/config/env.config.server";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfUnauthenticated, requireUser } from "@/session/guard.server";
import { BaseProfile, Profile } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, replace, useLoaderData } from "@remix-run/react";
import ProfileInfo from "./profile-info";
import ProfileNavbar from "./profile-navbar";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authHeader, user } = await requireUser(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const { username } = params;
  const response = await fetch(`${envConfig.API_URL}/profile/${username}/overview`);

  if (!response.ok) {
    return redirect("/", { headers });
  }

  const profile: Profile = (await response.json()).profile;

  return json({ profile, user }, { headers });
}

export default function ProfileLayout() {
  const { profile, user } = useLoaderData<typeof loader>();

  return (
    <div className="flex-1 flex flex-col w-full max-w-screen-lg p-6 md:pb-16 md:p-12 mx-auto gap-8">
      <ProfileInfo profile={profile} user={user} />
      <div className="space-y-4 md:space-y-6">
        <ProfileNavbar username={profile.username} />
        <Outlet />
      </div>
    </div>
  );
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const formData = await request.formData();
  const _action = formData.get("_action");

  const { username } = params;

  switch (_action) {
    case "follow":
      const usernameToFollow = formData.get("usernameToFollow") as string;
      if (usernameToFollow === user.username) {
        const actionState = { message: "Unauthorised." };
        return json({ actionState }, { status: 400, headers });
      }
      const response = await fetch(`${envConfig.API_URL}/profile/${user.id}/follow`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameToFollow }),
      });

      if (!response.ok) {
        return json(
          { actionState: { message: (await response.json()).error } },
          { status: 400, headers }
        );
      }

      return json(null, { headers });

    default:
      if (username !== user.username) {
        const actionState = { message: "Unauthorised." };
        return json({ actionState }, { status: 400, headers });
      }

      const baseSession = await getBaseSession(request.headers.get("Cookie"));
      baseSession.flash("_action", "edit");
      headers.append("Set-Cookie", await commitBaseSession(baseSession));

      const updateResponse = await fetch(`${envConfig.API_URL}/profile/${user.id}`, {
        method: "PUT",
        body: formData,
      });

      let deleteResponse = null;
      const avatar = formData.get("avatar") as File | null;
      if (avatar && avatar.size === 0) {
        deleteResponse = await fetch(`${envConfig.API_URL}/profile/${user.id}/avatar`, {
          method: "DELETE",
        });
      }

      let error, updatedProfile: BaseProfile;
      if (!updateResponse.ok || (deleteResponse && !deleteResponse.ok)) {
        error = (await updateResponse.json()).error;
        const actionState = { message: error };
        return json({ actionState }, { status: 400, headers });
      } else {
        updatedProfile = (await updateResponse.json()).profile;
        return replace(`/profile/${updatedProfile.username}`, { headers });
      }
  }
}
