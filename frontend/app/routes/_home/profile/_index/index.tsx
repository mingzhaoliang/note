import CldImage from "@/components/common/cld-image";
import InfiniteScrollTrigger from "@/components/common/infinite-scroll-trigger";
import { Gallery } from "@/components/icons";
import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { PostOverview } from "@/types";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LetterTextIcon } from "lucide-react";
import { useImmer } from "use-immer";

export default function Profile() {
  const { posts } = useLoaderData<typeof loader>();
  const [profilePosts, setProfilePosts] = useImmer(posts);
  const lastPostId = profilePosts[profilePosts.length - 1]?.id;

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
        {profilePosts.map((post) => (
          <div
            key={post.id}
            className="relative w-full h-fit aspect-[4/3] md:aspect-square bg-primary-foreground shadow-sm rounded-3xl flex-center"
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
                  fill
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
          </div>
        ))}
      </div>
      {lastPostId && (
        <InfiniteScrollTrigger
          loaderRoute={`/profile/?index&lastPostId=${lastPostId}`}
          setPosts={setProfilePosts}
          className="!mt-12"
        />
      )}
    </>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);

  const lastPostId = new URL(request.url).searchParams.get("lastPostId");

  const response = await fetch(
    `${envConfig.API_URL}/post/profile/${user.id}${lastPostId ? `?lastPostId=${lastPostId}` : ""}`
  );

  if (!response.ok) {
    return redirect("/");
  }

  const { posts } = (await response.json()) as { posts: PostOverview[] };

  return json({ posts }, { headers: authHeader ? { "Set-Cookie": authHeader } : undefined });
}
