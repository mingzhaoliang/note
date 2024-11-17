import PostCard from "@/components/post/post-card/post-card";
import LoadMoreTrigger from "@/components/shared/load-more-trigger";
import envConfig from "@/config/env.config.server";
import { requireUser } from "@/session/guard.server";
import {
  addFeeds,
  commentOnPost,
  deletePost,
  likeUnlikePost,
} from "@/store/redux/features/feed-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { Post } from "@/types";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useCallback } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, headers } = await requireUser(request);

  const searchParams = new URL(request.url).searchParams;
  if (user) searchParams.append("userId", user.id);

  const response = await fetch(`${envConfig.API_URL}/post?` + searchParams.toString());

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const data = await response.json();
  const posts: Post[] = data.data;
  const count: number = data.count;

  return json({ posts, count, user }, { headers });
}

export default function Index() {
  const { count, user } = useLoaderData<typeof loader>();
  const posts = useAppSelector((state) => state.feed);
  const dispatch = useAppDispatch();
  const last = posts[posts.length - 1]?.id;

  const handleLoadMore = useCallback(
    ({ posts }: { posts: Post[] }) => {
      dispatch(addFeeds(posts));
    },
    [dispatch]
  );

  const onLikeUnlike = useCallback((data: any) => {
    dispatch(likeUnlikePost(data.data));
  }, []);

  const onComment = useCallback((data: any) => {
    dispatch(commentOnPost(data.data));
  }, []);

  const onDelete = useCallback((id: string) => {
    dispatch(deletePost(id));
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center p-6 w-full md:max-w-2xl mx-auto">
      {posts.map((post) => (
        <Link
          key={post.id}
          to={`/profile/${post.profile.username}/post/${post.id}`}
          className="w-full md:max-w-2xl flex justify-center"
        >
          <PostCard
            key={post.id}
            {...post}
            userId={user?.id}
            onLikeUnlike={onLikeUnlike}
            onComment={onComment}
            onDelete={onDelete}
          />
        </Link>
      ))}
      {last && (
        <LoadMoreTrigger
          hasMore={count > posts.length}
          nextPageUrl={`/?index&last=${last}`}
          onLoad={handleLoadMore}
        />
      )}
    </div>
  );
}
