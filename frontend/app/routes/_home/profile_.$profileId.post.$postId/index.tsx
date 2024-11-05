import CommentGroups from "@/components/post/comment/comment-groups";
import PostDropdown from "@/components/post/post-card/post-dropdown";
import PostFooter from "@/components/post/post-card/post-footer";
import PostImages from "@/components/post/post-card/post-images";
import CldAvatar from "@/components/shared/cld-avatar";
import TagButton from "@/components/shared/tag-button";
import UsernameButton from "@/components/shared/username-button";
import { Separator } from "@/components/ui/separator";
import envConfig from "@/config/env.config.server";
import { postDateFormat } from "@/lib/utils/formatter";
import { requireUser } from "@/session/guard.server";
import { Comment, Post, Profile } from "@/types";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Await, defer, redirect, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { authHeader, user } = await requireUser(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const { postId } = params;
  if (!postId) {
    throw new Error("Oops! This post seems to be missing.");
  }

  const comments: Promise<Comment[]> = fetch(`${envConfig.API_URL}/post/${postId}/comments`)
    .then((response) => response.json())
    .then((data) => data.comments);

  const post = await fetch(`${envConfig.API_URL}/post/${postId}`)
    .then((response) => response.json())
    .then((data) => data.post as Post);

  const postOwner = await fetch(`${envConfig.API_URL}/profile/${post.profile.username}/overview`)
    .then((response) => response.json())
    .then((data) => data.profile as Profile);

  if (
    postOwner.private &&
    !user?.following.some(({ id, status }) => id === postOwner.id && status === "CONFIRMED")
  ) {
    return redirect("/", { headers });
  }

  return defer({ user, post, comments }, { headers });
}

export default function PostDetail() {
  const { user, post, comments } = useLoaderData<typeof loader>();
  const isOwner = post.profile.id === user?.id;
  const { id: postId, profile, images, text, tags, likes, commentCount, createdAt } = post;
  const navigate = useNavigate();
  const location = useLocation();

  const handleDelete = () => {
    if (location.state?.referrer) {
      navigate(location.state.referrer);
    } else {
      navigate("/?index");
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl flex-col space-y-3 p-6">
      <div className="flex-between gap-3">
        <CldAvatar profile={profile} />
        <div className="flex-1 text-sm flex items-center gap-3">
          <UsernameButton username={profile.username} />
          <p className="text-muted-foreground">{postDateFormat(createdAt)}</p>
        </div>
        <PostDropdown isOwner={isOwner} postId={postId} onDelete={handleDelete} />
      </div>
      {images.length > 0 && <PostImages images={images} />}
      <div className="flex items-center flex-wrap gap-2">
        <p className="text-foreground">{text}</p>
        {tags.map((tag, index) => (
          <TagButton key={tag + index} tag={tag} />
        ))}
      </div>
      <PostFooter postId={postId} userId={user?.id} likes={likes} commentCount={commentCount} />
      <Separator className="!my-8" />

      <Suspense fallback={<p>Loading comments...</p>}>
        <Await resolve={comments}>
          {(comments) => {
            return (
              <div className="flex flex-col gap-y-3">
                <CommentGroups comments={comments} user={user} />
              </div>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
