import { Gallery } from "@/components/icons";
import CreatePostDialog from "@/components/post/create-post-dialog";
import CldImage from "@/components/shared/cld-image";
import LoadMoreTrigger from "@/components/shared/load-more-trigger";
import { Button } from "@/components/ui/button";
import envConfig from "@/config/env.config.server";
import { requireUser } from "@/session/guard.server";
import { addPosts } from "@/store/redux/features/profile-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { Post, PostOverview } from "@/types";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { LetterTextIcon } from "lucide-react";
import { useCallback } from "react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { user, headers } = await requireUser(request);
  const { username } = params;

  const last = new URL(request.url).searchParams.get("last");

  const response = await fetch(
    `${envConfig.API_URL}/profile/${username}/posts${last ? `?last=${last}` : ""}`
  );

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const data = await response.json();
  const posts: PostOverview[] = data.data;
  const count: number = data.count;

  return json({ posts, count, user }, { headers });
}

export default function ProfilePosts() {
  const { count, user } = useLoaderData<typeof loader>();
  const posts = useAppSelector((state) => state.profile.posts);
  const dispatch = useAppDispatch();
  const { username } = useParams();
  const last = posts[posts.length - 1]?.id;
  const isOwner = user?.username === username;

  const handleLoadMore = useCallback(
    ({ posts }: { posts: Post[] }) => {
      dispatch(addPosts(posts));
    },
    [dispatch]
  );

  return (
    <>
      {posts.length === 0 && (
        <div className="py-6 flex-center flex-col">
          {isOwner ? (
            <>
              <p className="mb-6">You haven&apos;t post anything yet.</p>
              <CreatePostDialog asChild>
                <Button variant="outline">Create your first post</Button>
              </CreatePostDialog>
            </>
          ) : (
            <p className="mb-6">This user hasn&apos;t post anything yet.</p>
          )}
        </div>
      )}
      {posts.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/profile/${post.profile.username}/post/${post.id}`}
              className="relative w-full h-fit aspect-[4/3] md:aspect-square bg-primary-foreground shadow-sm rounded-3xl flex-center"
              state={{ referrer: `/profile/${post.profile.username}` }}
            >
              {post.images.length > 0 && (
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <CldImage
                    src={post.images[0]}
                    alt=""
                    responsive={[
                      { size: { width: 310, height: 190 }, maxWidth: 768 },
                      { size: { width: 620, height: 380 } },
                    ]}
                    dprVariants={[1, 3, 5]}
                    placeholder="blur"
                  />
                  {post.images.length > 1 && (
                    <Gallery className="absolute top-4 right-4 text-primary-foreground/80" />
                  )}
                </div>
              )}
              {post.images.length === 0 && (
                <div className="relative w-full h-full flex-center p-6">
                  <p className="line-clamp-4">{post.text}</p>
                  <LetterTextIcon className="absolute top-4 right-4" />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
      {posts.length > 0 && last && (
        <LoadMoreTrigger
          hasMore={count > posts.length}
          nextPageUrl={`/profile/${username}?index&last=${last}`}
          onLoad={handleLoadMore}
        />
      )}
    </>
  );
}
