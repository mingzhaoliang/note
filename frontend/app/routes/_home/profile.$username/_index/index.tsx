import envConfig from "@/config/env.config.server";
import { PostOverview } from "@/types";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import ProfilePostsSection from "./profile-posts-section";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username } = params;

  const lastPostId = new URL(request.url).searchParams.get("last");

  const response = await fetch(
    `${envConfig.API_URL}/profile/${username}/posts${lastPostId ? `?last=${lastPostId}` : ""}`
  );

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const { posts, totalPosts } = (await response.json()) as {
    posts: PostOverview[];
    totalPosts: number;
  };

  return json({ posts, totalPosts });
}

export default function ProfilePosts() {
  const { posts } = useLoaderData<typeof loader>();
  const { username } = useParams();

  return <ProfilePostsSection key={username} posts={posts} />;
}
