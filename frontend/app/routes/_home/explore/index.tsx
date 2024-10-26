import InfinitePosts from "@/components/shared/infinite-posts";
import { Input } from "@/components/ui/input";
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
import { Form, json, useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { SearchIcon } from "lucide-react";
import { useCallback, useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, authHeader } = await requireUser(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get("q");
  const lastPostId = searchParams.get("lastPostId");

  if (!q) {
    return json({ posts: [], user }, { headers });
  }

  const response = await fetch(
    `${envConfig.API_URL}/post/explore?` +
      new URLSearchParams({ q, ...(lastPostId && { lastPostId }) }).toString()
  );

  if (!response.ok) {
    console.log(await response.text());
    throw new Error("Oops! Something went wrong!");
  }

  const posts: Post[] = (await response.json()).posts;

  return json({ posts, user }, { headers });
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q");
  const searchedPosts = useAppSelector((state) => state.post.searchedPosts);
  const { posts: loadedPosts, user } = useLoaderData<typeof loader>();
  const dispatch = useAppDispatch();
  const fetcher = useFetcher({ key: "post" });

  const lastPostId = searchedPosts[searchedPosts.length - 1]?.id;

  const handleNewSearchedPosts = useCallback(
    (newPosts: Post[]) => {
      dispatch(addSearchedPosts(newPosts));
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
    <div className="flex-1 flex flex-col items-center p-6 w-full md:max-w-2xl mx-auto">
      <Form className="flex items-center gap-2 w-full bg-muted rounded-full px-4 py-2">
        <SearchIcon />
        <Input
          type="search"
          name="q"
          defaultValue={query || ""}
          placeholder="Search"
          className="masked-input no-highlight"
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
        />
      </Form>
      {query && (
        <InfinitePosts
          posts={searchedPosts}
          user={user}
          loaderRoute={"/explore?" + new URLSearchParams({ q: query, lastPostId }).toString()}
          onLoad={handleNewSearchedPosts}
        />
      )}
    </div>
  );
}
