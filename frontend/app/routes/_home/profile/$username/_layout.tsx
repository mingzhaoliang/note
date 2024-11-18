import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated, requireUser } from "@/session/guard.server";
import { setComments, setPosts, setProfile } from "@/store/redux/features/profile-slice";
import { useAppStore } from "@/store/redux/hooks";
import { ActionState, Profile } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useMatches } from "@remix-run/react";
import { useRef } from "react";
import ProfileInfo from "./profile-info";
import ProfileNavbar from "./profile-navbar";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user, headers } = await requireUser(request);

  const { username } = params;
  const response = await fetch(`${envConfig.API_URL}/profile/${username}`);

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const data = await response.json();
  const profile: Profile = data.data;

  return json({ profile, user }, { headers });
}

export default function ProfileLayout() {
  const { profile, user } = useLoaderData<typeof loader>();
  const initialised = useRef({ profile: false, posts: false, comments: false });
  const store = useAppStore();
  if (!initialised.current.profile) {
    store.dispatch(setProfile(profile));
  }

  const matches = useMatches();
  matches.forEach((match: any) => {
    if (match.id === "routes/_home/profile/$username/_index/index") {
      if (!initialised.current.posts) {
        initialised.current.posts = true;
        store.dispatch(setPosts(match.data.posts));
      }
    }
    if (match.id === "routes/_home/profile/$username/comments/index") {
      if (!initialised.current.comments) {
        initialised.current.comments = true;
        store.dispatch(setComments(match.data.comments));
      }
    }
  });

  const allowed =
    !profile.private ||
    user?.profile.following.some(
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
  const { user, headers } = await redirectIfUnauthenticated(request);

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
        const data = await response.json();
        actionState.message = data.message ?? response.statusText;
        return json(actionState, { status: 400, headers });
      }

      const avatar = formData.get("avatar") as File | null;
      if (avatar && avatar.size === 0) {
        fetch(`${envConfig.API_URL}/profile/${user.id}/avatar`, { method: "DELETE" });
      }

      return json(actionState, { headers });
    }

    case "follow":
    case "unfollow": {
      const toId = formData.get("toId") as string;
      if (toId === user.id) {
        actionState.message = "Cannot follow yourself";
        return json(actionState, { status: 401, headers });
      }
      const response = await fetch(`${envConfig.API_URL}/profile/${user.id}/${_action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: toId }),
      });

      if (!response.ok) {
        const data = await response.json();
        actionState.message = data.message ?? response.statusText;
        return json(actionState, { status: 400, headers });
      }

      return json(actionState, { headers });
    }

    case "confirm-request": {
      const response = await fetch(`${envConfig.API_URL}/profile/${user.id}/follow/confirm`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        actionState.message = data.message ?? response.statusText;
        return json(actionState, { status: 400, headers });
      }

      actionState.data = data.data;

      return json(actionState, { headers });
    }

    case "decline-request": {
      const response = await fetch(`${envConfig.API_URL}/profile/${user.id}/follow/decline`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        actionState.message = data.message ?? response.statusText;
        return json(actionState, { status: 400, headers });
      }

      actionState.data = data.data;

      return json(actionState, { headers });
    }
  }

  return json(actionState, { headers });
}

type ActionType =
  | "update-profile"
  | "follow"
  | "unfollow"
  | "confirm-request"
  | "decline-request"
  | null;
