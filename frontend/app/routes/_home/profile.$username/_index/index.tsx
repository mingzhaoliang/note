import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { BaseProfile, PostOverview } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { replace, useFetcher, useLoaderData, useParams } from "@remix-run/react";
import { useEffect } from "react";
import ProfilePostsSection from "./profile-posts-section";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username } = params;
  const baseSession = await getBaseSession(request.headers.get("Cookie"));
  const _action = baseSession.get("_action");

  const lastPostId = new URL(request.url).searchParams.get("lastPostId");

  const response = await fetch(
    `${envConfig.API_URL}/profile/${username}/posts${lastPostId ? `?lastPostId=${lastPostId}` : ""}`
  );

  if (!response.ok) {
    const { error } = await response.json();
    if (error === "Profile not found." && _action === "edit-profile")
      return json({ posts: [], totalPosts: 0 });
    throw new Error("Oops! Something went wrong!");
  }

  const { posts, totalPosts } = (await response.json()) as {
    posts: PostOverview[];
    totalPosts: number;
  };

  return json({ posts, totalPosts });
}

export default function ProfilePosts() {
  const { toast } = useToast();
  const fetcher = useFetcher<any>({ key: "edit-profile" });
  const { posts } = useLoaderData<typeof loader>();
  const { username } = useParams();

  useEffect(() => {
    if (!fetcher.data?.actionState) return;
    toast({ variant: "primary", title: fetcher.data.actionState.message });
  }, [fetcher.data?.actionState]);

  return <ProfilePostsSection key={username} posts={posts} />;
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);
  const baseSession = await getBaseSession(request.headers.get("Cookie"));
  baseSession.flash("_action", "edit-profile");
  headers.append("Set-Cookie", await commitBaseSession(baseSession));

  const { username } = params;
  if (username !== user.username) {
    return json({}, { status: 400 });
  }

  const formData = await request.formData();

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
