import InfinitePosts from "@/components/shared/infinite-posts";
import envConfig from "@/config/env.config.server";
import { OnRevalidate, useRevalidatePost } from "@/hooks/use-revalidate-post";
import { requireUser } from "@/session/guard.server";
import { addFeedPosts, initialiseFeed, RevalidatePost } from "@/store/redux/features/post-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { Post } from "@/types";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useCallback, useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, authHeader } = await requireUser(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const lastPostId = new URL(request.url).searchParams.get("last");

  const response = await fetch(
    `${envConfig.API_URL}/post/feed${lastPostId ? `?last=${lastPostId}` : ""}`
  );

  if (!response.ok) {
    console.error(await response.text());
    throw new Error("Oops! Something went wrong!");
  }

  const { posts, remaining } = (await response.json()) as { posts: Post[]; remaining: number };

  return json({ posts, remaining, user }, { headers });
}

export default function Index() {
  const feedPosts = useAppSelector((state) => state.post.feedPosts);
  const dispatch = useAppDispatch();
  const { posts: loadedPosts, user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher({ key: "post" });

  const lastPostId = feedPosts[feedPosts.length - 1]?.id;

  const handleLoadFeedPosts = useCallback(({ posts }: { posts: Post[] }) => {
    dispatch(addFeedPosts(posts));
  }, []);

  const handleRevalidate: OnRevalidate = useCallback((updatedPost, actionState) => {
    dispatch(RevalidatePost({ updatedPost, ...actionState }));
  }, []);

  useRevalidatePost(fetcher, handleRevalidate);

  useEffect(() => {
    dispatch(initialiseFeed(loadedPosts));
  }, [JSON.stringify(loadedPosts), dispatch]);

  return (
    <div className="flex-1 flex flex-col items-center p-6 w-full md:max-w-2xl mx-auto">
      <InfinitePosts
        posts={feedPosts}
        user={user}
        loaderRoute={`/?index&last=${lastPostId}`}
        onLoad={handleLoadFeedPosts}
      />
    </div>
  );
}
