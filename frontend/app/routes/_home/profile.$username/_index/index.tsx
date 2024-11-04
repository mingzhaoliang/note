import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { getBaseSession } from "@/session/base-session.server";
import { PostOverview } from "@/types";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, useParams } from "@remix-run/react";
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
    if (error === "Profile not found." && _action === "edit") {
      return json({ posts: [], totalPosts: 0 });
    }
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
