import { Gallery } from "@/components/icons";
import CreatePostDialog from "@/components/post/create-post-dialog";
import CldImage from "@/components/shared/cld-image";
import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import { Button } from "@/components/ui/button";
import { useSession } from "@/store/context/session.context";
import { PostOverview } from "@/types";
import { Link, useParams } from "@remix-run/react";
import { LetterTextIcon } from "lucide-react";
import { useCallback } from "react";
import { useImmer } from "use-immer";

type ProfilePostsSectionProps = {
  posts: PostOverview[];
};

export default function ProfilePostsSection({ posts }: ProfilePostsSectionProps) {
  const [profilePosts, setProfilePosts] = useImmer(posts);
  const lastPostId = profilePosts[profilePosts.length - 1]?.id;
  const { username } = useParams();
  const { user } = useSession();
  const isOwner = user?.username === username;

  const handleLoadProfilePosts = useCallback(({ posts }: { posts: PostOverview[] | null }) => {
    if (!posts) return;
    setProfilePosts((draft) => {
      draft.push(...posts);
    });
  }, []);

  return (
    <>
      {profilePosts.length === 0 && (
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
      {profilePosts.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
          {profilePosts.map((post) => (
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
      {profilePosts.length > 0 && lastPostId && (
        <InfiniteScrollTrigger
          loaderRoute={`/profile/${username}?index&lastPostId=${lastPostId}`}
          onLoad={handleLoadProfilePosts}
          className="py-4"
        />
      )}
    </>
  );
}
