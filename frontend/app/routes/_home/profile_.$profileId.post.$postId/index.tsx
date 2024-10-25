import CommentGroups from "@/components/post/comment/comment-groups";
import PostDropdown from "@/components/post/post-card/post-dropdown";
import PostFooter from "@/components/post/post-card/post-footer";
import PostImages from "@/components/post/post-card/post-images";
import { Avatar, AvatarFallback, CldAvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import envConfig from "@/config/env.config.server";
import { postDateFormat } from "@/lib/utils/formatter";
import { requireUser } from "@/session/guard.server";
import { Comment, Post } from "@/types";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Await, defer, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
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
        <Avatar>
          <CldAvatarImage src={profile.avatar || undefined} />
          <AvatarFallback>{profile.name[0]}</AvatarFallback>
        </Avatar>
        <p className="flex-1 text-sm flex items-center gap-3">
          <span className="font-semibold">{profile.username}</span>
          <span className="text-muted-foreground">{postDateFormat(createdAt)}</span>
        </p>
        <PostDropdown isOwner={isOwner} postId={postId} onDelete={handleDelete} />
      </div>
      {images.length > 0 && <PostImages images={images} />}
      <div className="flex items-center flex-wrap gap-2">
        <p className="text-foreground">{text}</p>
        {tags.map((tag, index) => (
          <Badge key={tag + index} variant="secondary" className="rounded-full">
            {tag}
          </Badge>
        ))}
      </div>
      <PostFooter postId={postId} userId={user?.id} likes={likes} commentCount={commentCount} />
      <Separator className="!my-8" />

      <Suspense fallback={<p>Loading comments...</p>}>
        <Await resolve={comments}>
          {(comments) => {
            return (
              <div className="flex flex-col gap-y-8">
                <CommentGroups comments={comments} user={user} />
              </div>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
