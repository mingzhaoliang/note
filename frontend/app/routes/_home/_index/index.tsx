import PostCard from "@/components/post/post-card/post-card";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { cloudinary } from "@/service/.server/cloudinary.service";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfUnauthenticated, requireUser } from "@/session/guard.server";
import { useFeed } from "@/store/feed.context";
import { Post } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";

export default function Index() {
  const { toast } = useToast();
  const { posts, setPosts } = useFeed();
  const { posts: loadedPosts, userId, formState } = useLoaderData<typeof loader>();

  useEffect(() => {
    setPosts((draft) => {
      if (draft.length === 0) {
        draft.push(...loadedPosts);
        return;
      }

      switch (formState?._action) {
        case "create":
          const tmpPostIndex = draft.findIndex(
            (post) => post.id.startsWith("tmp-") && post.createdAt === formState.createdAt
          );
          if (tmpPostIndex === -1) break;
          // Fail to create post - delete temp post
          if (loadedPosts.length === 0) {
            draft.splice(tmpPostIndex, 1);
            break;
          }
          // Success to create post - update temp post
          const createdPost = loadedPosts[0];
          draft[tmpPostIndex] = createdPost;
          break;
        case "like":
          // No need to update if mutation succeeded
          if (!formState.message) break;

          // Restore like stats if mutation failed
          const postIndex = draft.findIndex((post) => post.id === formState.postId);
          if (postIndex === -1) break;
          draft[postIndex].likes = loadedPosts[0].likes;
          break;
        case "delete":
          // Do nothing - undeleted posts will be loaded again upon refresh
          break;
      }
    });
  }, [loadedPosts, formState]);

  useEffect(() => {
    if (formState?.message) {
      toast({
        variant: "primary",
        title: formState.message,
      });
    }
  }, [formState]);

  return (
    <div className="flex-1 flex flex-col items-center p-6 gap-8">
      {posts.map((post) => (
        <div key={post.id} className="w-full flex flex-col items-center md:max-w-2xl">
          <PostCard {...post} userId={userId} />
        </div>
      ))}
    </div>
  );
}

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
    default:
      response = await fetch(`${envConfig.API_URL}/post/feed`);
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
      profile: {
        ...post.profile,
        avatar: post.profile.avatar ? cloudinary.url(post.profile.avatar) : null,
      },
      tags: post.tags.map(({ tag: { name } }: any) => name),
      images: post.images.map(({ publicId }: any) => cloudinary.url(publicId)),
      likes: post.likes.map(({ profileId }: any) => profileId),
      commentCount: post._count?.comments ?? post.comments?.length ?? 0,
    }));
  }

  return json(
    { posts: postsDto, userId: user?.id, formState },
    { headers: { "Set-Cookie": await commitBaseSession(baseSession) } }
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
      response = await fetch(`${envConfig.API_URL}/post/like`, {
        method: "POST",
        body: formData,
      });
      break;
    case "delete":
      response = await fetch(`${envConfig.API_URL}/post/delete`, {
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
