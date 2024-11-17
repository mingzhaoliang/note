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

  const data = await response.json();
  const posts: PostOverview[] = data.data;
  const count: number = data.count;

  return json({ posts, count });
}

export default function ProfilePosts() {
  const { posts } = useLoaderData<typeof loader>();
  const { username } = useParams();

  return <ProfilePostsSection key={username} posts={posts} />;
}
