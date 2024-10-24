import PostCard from "@/components/post/post-card/post-card";
import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import envConfig from "@/config/env.config.server";
import { OnRevalidate, useRevalidatePost } from "@/hooks/use-revalidate-post";
import { requireUser } from "@/session/guard.server";
import { addFeedPosts, initialiseFeed, RevalidatePost } from "@/store/redux/features/post-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { Post } from "@/types";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useCallback, useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, authHeader } = await requireUser(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const lastPostId = new URL(request.url).searchParams.get("lastPostId");

  const response = await fetch(
    `${envConfig.API_URL}/post/feed${lastPostId ? `?lastPostId=${lastPostId}` : ""}`
  );

  if (!response.ok) {
    console.error(await response.text());
    throw new Error("Oops! Something went wrong!");
  }

  const posts: Post[] = (await response.json()).posts;

  return json({ posts, userId: user?.id }, { headers });
}

export default function Index() {
  const feedPosts = useAppSelector((state) => state.post.feedPosts);
  const dispatch = useAppDispatch();
  const { posts: loadedPosts, userId } = useLoaderData<typeof loader>();
  const fetcher = useFetcher({ key: "post" });

  const lastPostId = feedPosts[feedPosts.length - 1]?.id;

  const handleNewFeedPosts = useCallback(
    (newPosts: Post[]) => {
      dispatch(addFeedPosts(newPosts));
    },
    [dispatch]
  );

  const handleRevalidate: OnRevalidate = useCallback(
    (updatedPost, actionState) => {
      dispatch(RevalidatePost({ updatedPost, ...actionState }));
    },
    [dispatch]
  );

  useRevalidatePost(fetcher, handleRevalidate);

  useEffect(() => {
    dispatch(initialiseFeed(loadedPosts));
  }, [JSON.stringify(loadedPosts), dispatch]);

  return (
    <div className="flex-1 flex flex-col items-center p-6">
      {feedPosts.map((post) => {
        if (post.id.startsWith("tmp-")) {
          <PostCard key={post.id} {...post} userId={userId} className="md:max-w-2xl" />;
        }

        return (
          <Link
            key={post.id}
            to={`/profile/${post.profile.username}/post/${post.id}`}
            className="w-full md:max-w-2xl flex justify-center"
            state={{ referrer: "/?index" }}
          >
            <PostCard key={post.id} {...post} userId={userId} />
          </Link>
        );
      })}
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
