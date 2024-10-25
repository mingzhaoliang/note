import { Gallery } from "@/components/icons";
import CldImage from "@/components/shared/cld-image";
import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import { PostOverview } from "@/types";
import { Link, useParams } from "@remix-run/react";
import { LetterTextIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useImmer } from "use-immer";

type ProfilePostsSectionProps = {
  posts: PostOverview[];
};

export default function ProfilePostsSection({ posts }: ProfilePostsSectionProps) {
  const [profilePosts, setProfilePosts] = useImmer(posts);
  const lastPostId = profilePosts[profilePosts.length - 1]?.id;
  const { username } = useParams();

  const handleNewProfilePosts = useCallback((newPosts: PostOverview[] | null) => {
    if (!newPosts) return;
    setProfilePosts((draft) => {
      draft.push(...newPosts);
    });
  }, []);

  return (
    <>
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
              <>
                <p>{post.text}</p>
                <LetterTextIcon className="absolute top-4 right-4" />
              </>
            )}
          </Link>
        ))}
      </div>
      {lastPostId && (
        <InfiniteScrollTrigger
          loaderRoute={`/profile/${username}?index&lastPostId=${lastPostId}`}
          onLoad={handleNewProfilePosts}
          className="!mt-12"
        />
      )}
    </>
  );
}
