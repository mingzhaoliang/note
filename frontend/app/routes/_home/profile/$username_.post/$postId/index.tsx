import CommentGroups from "@/components/post/comment/comment-groups";
import PostDropdown from "@/components/post/post-card/post-dropdown";
import PostImages from "@/components/post/post-card/post-images";
import CldAvatar from "@/components/shared/cld-avatar";
import CommentButton from "@/components/shared/comment-button";
import LikeButton from "@/components/shared/like-button";
import TagButton from "@/components/shared/tag-button";
import UsernameButton from "@/components/shared/username-button";
import { Separator } from "@/components/ui/separator";
import envConfig from "@/config/env.config.server";
import { postDateFormat } from "@/lib/utils/formatter";
import { redirectIfUnauthenticated, requireUser } from "@/session/guard.server";
import { ActionState, Comment, Post, Profile } from "@/types";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  defer,
  json,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { user, headers } = await requireUser(request);

  const { postId } = params;
  if (!postId) {
    throw new Error("Oops! This post seems to be missing.");
  }

  const comments: Promise<Comment[]> = fetch(`${envConfig.API_URL}/post/${postId}/comments`)
    .then((response) => response.json())
    .then((data) => data.data);

  const post: Post = await fetch(`${envConfig.API_URL}/post/${postId}`)
    .then((response) => response.json())
    .then((data) => data.data);

  const postOwner: Profile = await fetch(`${envConfig.API_URL}/profile/${post.profile.username}`)
    .then((response) => response.json())
    .then((data) => data.data);

  if (
    postOwner.private &&
    !user?.following.some(({ id, status }) => id === postOwner.id && status === "CONFIRMED")
  ) {
    return redirect("/", { headers });
  }

  return defer({ user, post, comments }, { headers });
}

export default function Index() {
  const { user, post, comments } = useLoaderData<typeof loader>();
  const isOwner = post.profile.id === user?.id;
  const { id: postId, profile, images, text, tags, likes, _count, createdAt } = post;
  const navigate = useNavigate();
  const location = useLocation();
  const hasLiked = user ? likes.includes(user.id) : false;

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
        <CldAvatar avatar={profile.avatar} name={profile.name} />
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
      <LikeButton
        postId={postId}
        postOwnerUsername={post.profile.username}
        hasLiked={hasLiked}
        count={_count.likes}
      />
      <CommentButton
        postOwnerUsername={post.profile.username}
        parentId={postId}
        count={_count.comments}
      />
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

export async function action({ request, params }: ActionFunctionArgs) {
  const { user, headers } = await redirectIfUnauthenticated(request);
  const { postId } = params;

  const formData = await request.formData();
  const _action = formData.get("_action") as ActionType;

  const actionState: ActionState<ActionType> = { _action, message: null, data: null };

  switch (_action) {
    case "like-unlike": {
      const res = await fetch(`${envConfig.API_URL}/post/${postId}/like-unlike`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        actionState.message = data.message ?? res.statusText;
        return json(actionState, { headers });
      }

      actionState.data = data.data;

      return json(actionState, { headers });
    }

    case "comment": {
      formData.set("profileId", user.id);

      const res = await fetch(`${envConfig.API_URL}/post/comment`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        actionState.message = data.message ?? res.statusText;
        return json(actionState, { headers });
      }

      actionState.data = data.data;

      return json(actionState, { headers });
    }

    case "delete": {
      const res = await fetch(`${envConfig.API_URL}/post/${postId}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        actionState.message = data.message ?? res.statusText;
        return json(actionState, { headers });
      }

      actionState.data = data.data;

      return json(actionState, { headers });
    }
  }
}

type ActionType = "like-unlike" | "comment" | "delete";
