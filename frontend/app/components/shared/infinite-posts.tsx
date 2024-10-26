import PostCard from "@/components/post/post-card/post-card";
import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import { Post, User } from "@/types";
import { Link } from "@remix-run/react";

type InfinitePostsProps<T> = {
  posts: Post[];
  user: User | null;
  loaderRoute: string;
  onLoad: (posts: T[]) => void;
};

export default function InfinitePosts<T>({
  posts,
  user,
  loaderRoute,
  onLoad,
}: InfinitePostsProps<T>) {
  const lastPostId = posts[posts.length - 1]?.id;

  return (
    <>
      {posts.map((post) => {
        if (post.id.startsWith("tmp-")) {
          <PostCard key={post.id} {...post} userId={user?.id} />;
        }

        return (
          <Link
            key={post.id}
            to={`/profile/${post.profile.username}/post/${post.id}`}
            className="w-full md:max-w-2xl flex justify-center"
            state={{ referrer: "/?index" }}
          >
            <PostCard key={post.id} {...post} userId={user?.id} />
          </Link>
        );
      })}
      {lastPostId && (
        <InfiniteScrollTrigger loaderRoute={loaderRoute} onLoad={onLoad} className="my-4" />
      )}
    </>
  );
}
