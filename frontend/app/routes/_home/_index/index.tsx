import PostCard from "@/components/post/post-card/post-card";
import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfUnauthenticated, requireUser } from "@/session/guard.server";
import {
  addFeedPosts,
  createPostRevalidate,
  incrementCommentRevalidate,
  initialiseFeed,
  likeUnlikePostRevalidate,
} from "@/store/redux/features/post-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { Post } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useCallback, useEffect } from "react";

type FormState =
  | {
      message: string;
      _action: string;
      postId: string;
      createdAt?: string;
    }
  | undefined;

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireUser(request);

  const baseSession = await getBaseSession(request.headers.get("Cookie"));

  const formState_ = baseSession.get("formState");
  let formState: FormState = formState_ ? JSON.parse(formState_) : undefined;

  let response: Response | undefined;

  switch (formState?._action) {
    case "create":
      if (!formState.message) {
        response = await fetch(`${envConfig.API_URL}/post/${formState.postId}`);
      }
      break;
    case "like":
      response = await fetch(`${envConfig.API_URL}/post/${formState.postId}`);
      break;
    case "delete":
      if (formState.message) {
        response = await fetch(`${envConfig.API_URL}/post/${formState.postId}`);
      }
      break;
    case "comment":
      response = await fetch(`${envConfig.API_URL}/post/${formState.postId}`);
      break;
    default:
      const lastPostId = new URL(request.url).searchParams.get("lastPostId");

      response = await fetch(
        `${envConfig.API_URL}/post/feed${lastPostId ? `?lastPostId=${lastPostId}` : ""}`
      );
  }

  if (response && !response.ok) {
    console.error(await response.text());
    throw new Error("Oops! Something went wrong!");
  }

  let postsDto: Post[] = [];

  if (response) {
    const data = await response.json();
    const posts = data.posts ?? [data.post];

    postsDto = posts.map((post: any) => ({
      ...post,
      commentCount: post.commentCount ?? post.comments?.length ?? 0,
    }));
  }

  return json(
    { posts: postsDto, userId: user?.id, formState },
    { headers: { "Set-Cookie": await commitBaseSession(baseSession) } }
  );
}

export default function Index() {
  const { toast } = useToast();
  const feedPosts = useAppSelector((state) => state.post.feedPosts);
  const dispatch = useAppDispatch();
  const { posts: loadedPosts, userId, formState } = useLoaderData<typeof loader>();

  const lastPostId = feedPosts[feedPosts.length - 1]?.id;

  const handleNewFeedPosts = useCallback((newPosts: Post[]) => {
    dispatch(addFeedPosts(newPosts));
  }, []);

  useEffect(() => {
    dispatch(initialiseFeed(loadedPosts));
  }, [JSON.stringify(loadedPosts), dispatch]);

  useEffect(() => {
    if (formState?.message) {
      toast({
        variant: "primary",
        title: formState.message,
      });
    }

    switch (formState?._action) {
      case "create":
        dispatch(
          createPostRevalidate({ createdPost: loadedPosts[0], createdAt: formState.createdAt })
        );
        break;
      case "like":
        // No need to update if mutation succeeded
        if (!formState.message) break;
        // Restore like stats if mutation failed
        dispatch(
          likeUnlikePostRevalidate({ postId: formState.postId, likes: loadedPosts[0].likes })
        );
        break;
      case "comment":
        // No need to update if mutation succeeded
        if (!formState.message) break;
        // Restore comment count if mutation failed
        dispatch(
          incrementCommentRevalidate({
            postId: formState.postId,
            commentCount: loadedPosts[0].commentCount,
          })
        );
        break;
      case "delete":
        // Do nothing - undeleted posts will be loaded again upon refresh
        break;
    }
  }, [loadedPosts, formState, dispatch]);

  return (
    <div className="flex-1 flex flex-col items-center p-6 gap-8">
      {feedPosts.map((post) => (
        <PostCard key={post.id} {...post} userId={userId} className="md:max-w-2xl" />
      ))}
      {lastPostId && (
        <InfiniteScrollTrigger
          loaderRoute={`/?index&lastPostId=${lastPostId}`}
          onLoad={handleNewFeedPosts}
          className="my-4"
        />
      )}
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const baseSession = await getBaseSession(request.headers.get("Cookie"));

  const formData = await request.formData();
  formData.append("profileId", user.id);
  const _action = formData.get("_action");
  const createdAt = formData.get("createdAt");
  let postId = formData.get("postId");

  let response = null;

  switch (_action) {
    case "create":
      const tags = Array.from(formData.entries())
        .filter(([key]) => key.startsWith("tags"))
        .map(([, value]) => value as string);

      formData.set("tags", JSON.stringify(tags));

      response = await fetch(`${envConfig.API_URL}/post/create`, {
        method: "POST",
        body: formData,
      });
      break;
    case "like":
    case "delete":
    case "comment":
      response = await fetch(`${envConfig.API_URL}/post/${_action}`, {
        method: "POST",
        body: formData,
      });

      break;
  }

  let message;

  if (!response || !response.ok) {
    message = response ? await response.text() : "Oops! Something went wrong.";
  } else {
    postId = (await response.json()).postId;
  }

  const formState = { message, _action, postId, createdAt };
  baseSession.flash("formState", JSON.stringify(formState));

  const headers = new Headers();
  headers.append("Set-Cookie", await commitBaseSession(baseSession));
  if (authHeader) headers.append("Set-Cookie", authHeader);

  return json({}, { headers });
}
