import envConfig from "@/config/env.config.server";
import { getBaseSession } from "@/session/base-session.server";
import { ProfileComment } from "@/types";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import ProfileCommentsSection from "./profile-comments-section";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username } = params;
  const baseSession = await getBaseSession(request.headers.get("Cookie"));
  const _action = baseSession.get("_action");

  const lastCommentId = new URL(request.url).searchParams.get("lastCommentId");

  const response = await fetch(
    `${envConfig.API_URL}/profile/${username}/comments${
      lastCommentId ? `?lastCommentId=${lastCommentId}` : ""
    }`
  );

  if (!response.ok) {
    const { error } = await response.json();
    if (error === "Profile not found." && _action === "edit-profile")
      return json({ comments: [], totalComments: 0 });
    throw new Error("Oops! Something went wrong!");
  }

  const { comments, totalComments } = (await response.json()) as {
    comments: ProfileComment[];
    totalComments: number;
  };

  return json({ comments, totalComments });
}

export default function ProfileComments() {
  const { comments } = useLoaderData<typeof loader>();
  const { username } = useParams();

  return <ProfileCommentsSection key={username} comments={comments} />;
}
