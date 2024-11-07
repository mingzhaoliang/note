import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated, requireUser } from "@/session/guard.server";
import { ActionState, Profile } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
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
  const allowed =
    !profile.private ||
    user?.following.some(
      (following) => following.id === profile.id && following.status === "CONFIRMED"
    ) ||
    user?.id === profile.id;

  return (
    <div className="flex-1 flex flex-col w-full max-w-screen-lg p-6 md:pb-16 md:p-12 mx-auto gap-8">
      <ProfileInfo profile={profile} />
      <div className="space-y-4 md:space-y-6">
        <ProfileNavbar username={profile.username} />
        {allowed && <Outlet />}
        {!allowed && <p className="text-center py-6">This profile is private.</p>}
      </div>
    </div>
  );
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const formData = await request.formData();
  const _action = formData.get("_action") as ActionType;

  const { username } = params;

  let actionState: ActionState<ActionType> = { _action, message: null, data: null };

  switch (_action) {
    case "update-profile": {
      if (username !== user.username) {
        actionState.message = "Unauthorised";
        return json(actionState, { status: 401, headers });
      }
      const response = await fetch(`${envConfig.API_URL}/profile/${user.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        actionState.message =
          response.status === 400 ? (await response.json()).message : response.statusText;
        return json(actionState, { status: 400, headers });
      }

      const avatar = formData.get("avatar") as File | null;
      if (avatar && avatar.size === 0) {
        fetch(`${envConfig.API_URL}/profile/${user.id}/avatar`, { method: "DELETE" });
      }

      return json(actionState, { headers });
    }

    case "follow": {
      const toId = formData.get("toId") as string;
      if (toId === user.id) {
        actionState.message = "Cannot follow yourself";
        return json(actionState, { status: 401, headers });
      }
      const response = await fetch(`${envConfig.API_URL}/profile/${user.id}/follow`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: toId }),
      });

      if (!response.ok) {
        actionState.message =
          response.status === 400 ? (await response.json()).error : response.statusText;
        return json(actionState, { status: 400, headers });
      }

      return json(actionState, { headers });
    }

    case "confirm-request": {
      const response = await fetch(`${envConfig.API_URL}/profile/${user.id}/follow/confirm`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        actionState.message =
          response.status === 400 ? (await response.json()).error : response.statusText;
        return json(actionState, { status: 400, headers });
      }

      actionState.data = (await response.json()).relationship;

      return json(actionState, { headers });
    }

    case "decline-request": {
      const response = await fetch(`${envConfig.API_URL}/profile/${user.id}/follow/decline`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        actionState.message =
          response.status === 400 ? (await response.json()).error : response.statusText;
        return json(actionState, { status: 400, headers });
      }

      actionState.data = (await response.json()).relationship;

      return json(actionState, { headers });
    }
  }

  return json(actionState, { headers });
}

type ActionType = "update-profile" | "follow" | "confirm-request" | "decline-request" | null;
