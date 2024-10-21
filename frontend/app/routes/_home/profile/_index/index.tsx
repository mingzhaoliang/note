import CldImage from "@/components/common/cld-image";
import { Gallery } from "@/components/icons";
import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { PostOverview } from "@/types";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LetterTextIcon } from "lucide-react";

export default function Profile() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative w-full h-fit aspect-[4/3] md:aspect-square bg-primary-foreground shadow-sm rounded-3xl flex-center"
        >
          {post.images.length > 0 && (
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <CldImage
                src={post.images[0].publicId}
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
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);

  const response = await fetch(`${envConfig.API_URL}/post/profile/${user.id}`);

  if (!response.ok) {
    return redirect("/");
  }

  const { posts } = (await response.json()) as { posts: PostOverview[] };

  return json({ posts }, { headers: authHeader ? { "Set-Cookie": authHeader } : undefined });
}
