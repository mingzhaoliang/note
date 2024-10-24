import { Gallery } from "@/components/icons";
import CldImage from "@/components/shared/cld-image";
import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { PostOverview } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { LetterTextIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useImmer } from "use-immer";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username } = params;
  const baseSession = await getBaseSession(request.headers.get("Cookie"));
  const formState_ = baseSession.get("formState");
  let formState = formState_ ? JSON.parse(formState_) : undefined;

  let posts: PostOverview[] = [];

  const lastPostId = new URL(request.url).searchParams.get("lastPostId");

  if (!formState) {
    const response = await fetch(
      `${envConfig.API_URL}/post/profile/${username}${
        lastPostId ? `?lastPostId=${lastPostId}` : ""
      }`
    );

    if (!response.ok) {
      formState = {};
      formState.message = "Something went wrong!";
    }

    posts = (await response.json()).posts;
  }

  return json({ posts, formState });
}

export default function Profile() {
  const { toast } = useToast();
  const { posts, formState } = useLoaderData<typeof loader>();
  const [profilePosts, setProfilePosts] = useImmer(posts);
  const lastPostId = profilePosts[profilePosts.length - 1]?.id;
  const { username } = useParams();

  const handleNewProfilePosts = useCallback((newPosts: PostOverview[]) => {
    setProfilePosts((draft) => {
      draft.push(...newPosts);
    });
  }, []);

  useEffect(() => {
    if (!formState) return;
    toast({ variant: "primary", title: formState.message });
  }, [formState]);

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
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

export async function action({ params, request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const baseSession = await getBaseSession(request.headers.get("Cookie"));

  const { username } = params;
  if (username !== user.username) {
    return json({}, { status: 400 });
  }

  const formData = await request.formData();

  const updateResponse = await fetch(`${envConfig.API_URL}/profile/${user.id}`, {
    method: "PUT",
    body: formData,
  });

  let deleteResponse = null;
  const avatar = formData.get("avatar") as File | null;
  if (avatar && avatar.size === 0) {
    deleteResponse = await fetch(`${envConfig.API_URL}/profile/${user.id}/avatar`, {
      method: "DELETE",
    });
  }

  let error = undefined;
  if (!updateResponse.ok) {
    error = (await updateResponse.json()).error;
  } else if (deleteResponse && !deleteResponse.ok) {
    error = await deleteResponse.text();
  }
  if (error) baseSession.flash("formState", JSON.stringify({ message: error }));

  const headers = new Headers();
  headers.append("Set-Cookie", await commitBaseSession(baseSession));
  if (authHeader) headers.append("Set-Cookie", authHeader);

  return json({}, { headers });
}
