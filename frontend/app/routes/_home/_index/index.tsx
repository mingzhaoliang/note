import PostCard from "@/components/post/post-card/post-card";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { cloudinary } from "@/service/.server/cloudinary.service";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfUnauthenticated, requireUser } from "@/session/guard.server";
import { Post } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";

export default function Index() {
  const { posts, userId, formState } = useLoaderData<typeof loader>();
  const { toast } = useToast();

  useEffect(() => {
    if (formState.message) {
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

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await requireUser(request);
  const baseSession = await getBaseSession(request.headers.get("Cookie"));
  const lastPostId: string | undefined = baseSession.get("lastPostId");
  const response = await fetch(
    `${envConfig.API_URL}/post/feed` + (lastPostId ? `?lastPostId=${lastPostId}` : "")
  );

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const { posts } = await response.json();

  const postsDto: Post[] = posts.map((post: any) => ({
    ...post,
    profile: {
      ...post.profile,
      avatar: post.profile.avatar ? cloudinary.url(post.profile.avatar) : null,
    },
    tags: post.tags.map(({ tag: { name } }: any) => name),
    images: post.images.map(({ publicId }: any) => cloudinary.url(publicId)),
    likes: post.likes.map(({ profileId }: any) => profileId),
    commentCount: post._count.comments,
  }));

  const message: string | undefined = baseSession.get("message");

  return json(
    { posts: postsDto, userId: user?.id, formState: { message } },
    { headers: { "Set-Cookie": await commitBaseSession(baseSession) } }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const formData = await request.formData();
  formData.append("profileId", user.id);
  const _action = formData.get("_action");

  let response = null;

  switch (_action) {
    case "create":
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

  const baseSession = await getBaseSession(request.headers.get("Cookie"));
  if (!response || !response.ok) {
    const error = response ? await response.text() : "Oops! Something went wrong.";
    baseSession.flash("message", error);
  }

  const headers = new Headers();
  headers.append("Set-Cookie", await commitBaseSession(baseSession));
  if (authHeader) headers.append("Set-Cookie", authHeader);

  return json({}, { headers });
}
