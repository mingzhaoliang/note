import InfinitePosts from "@/components/shared/infinite-posts";
import envConfig from "@/config/env.config.server";
import { OnRevalidate, useRevalidatePost } from "@/hooks/use-revalidate-post";
import { requireUser } from "@/session/guard.server";
import {
  addSearchedPosts,
  initialiseSearchedPosts,
  RevalidatePost,
} from "@/store/redux/features/post-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { Post } from "@/types";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect, useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { useCallback, useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, headers } = await requireUser(request);

  const searchParams = new URL(request.url).searchParams;

  const q = searchParams.get("q");
  if (!q) return redirect("/explore", { headers });

  if (user) searchParams.append("userId", user.id);
  const response = await fetch(`${envConfig.API_URL}/post/search?` + searchParams.toString());

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const { posts, remaining } = (await response.json()) as { posts: Post[]; remaining: number };

  return json({ posts, remaining, user }, { headers });
}

export default function Index() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")!;
  const searchedPosts = useAppSelector((state) => state.post.searchedPosts);
  const { posts: loadedPosts, user } = useLoaderData<typeof loader>();
  const dispatch = useAppDispatch();
  const fetcher = useFetcher({ key: "post" });

  const lastPostId = searchedPosts[searchedPosts.length - 1]?.id;

  const handleLoadSearchedPosts = useCallback(
    ({ posts }: { posts: Post[] }) => {
      dispatch(addSearchedPosts(posts));
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
    dispatch(initialiseSearchedPosts(loadedPosts));
  }, [loadedPosts, query, dispatch]);

  return (
    <div className="flex-1 flex flex-col items-center py-6 w-full md:max-w-2xl mx-auto">
      {searchedPosts.length > 0 ? (
        <InfinitePosts
          posts={searchedPosts}
          user={user}
          loaderRoute={
            "/explore/posts?" + new URLSearchParams({ q: query, last: lastPostId }).toString()
          }
          onLoad={handleLoadSearchedPosts}
        />
      ) : (
        <div className="flex-1 flex-center py-6 w-full md:max-w-2xl mx-auto">No posts found.</div>
      )}
    </div>
  );
}
