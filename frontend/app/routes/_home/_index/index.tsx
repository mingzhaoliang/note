import PostCard from "@/components/post/post-card";
import envConfig from "@/config/env.config.server";
import { cloudinary } from "@/service/.server/cloudinary.service";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { requireUser } from "@/session/guard.server";
import { Post } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export default function Index() {
  const { posts, userId } = useLoaderData<typeof loader>();

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

  return json(
    { posts: postsDto, userId: user?.id },
    { headers: { "Set-Cookie": await commitBaseSession(baseSession) } }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { user } = await requireUser(request);
  if (!user) return redirect("/login");

  const formData = await request.formData();
  const { _action, ...payload } = Object.fromEntries(formData);

  let response = null;

  switch (_action) {
    case "like":
      response = await fetch(`${envConfig.API_URL}/post/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: payload.postId,
          profileId: user.id,
        }),
      });
      break;
    case "delete":
      response = await fetch(`${envConfig.API_URL}/post/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: payload.postId,
          profileId: user.id,
        }),
      });
      break;
  }

  if (!response || !response.ok) {
    const baseSession = await getBaseSession(request.headers.get("Cookie"));
    baseSession.flash("message", "Oops! Something went wrong.");

    return json(
      {},
      { status: 400, headers: { "Set-Cookie": await commitBaseSession(baseSession) } }
    );
  }

  return null;
}
