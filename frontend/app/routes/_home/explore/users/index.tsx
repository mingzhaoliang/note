import CldAvatar from "@/components/shared/cld-avatar";
import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import envConfig from "@/config/env.config.server";
import { requireUser } from "@/session/guard.server";
import { Profile } from "@/types";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, redirect, useLoaderData, useSearchParams } from "@remix-run/react";
import { useCallback } from "react";
import { useImmer } from "use-immer";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, authHeader } = await requireUser(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get("q");
  const lastUserId = searchParams.get("last");

  if (!q) {
    return redirect("/explore", { headers });
  }

  const response = await fetch(
    `${envConfig.API_URL}/profile/explore?` +
      new URLSearchParams({ q, ...(lastUserId && { last: lastUserId }) }).toString()
  );

  if (!response.ok) {
    console.log(await response.text());
    throw new Error("Oops! Something went wrong!");
  }

  const { profiles, remaining } = (await response.json()) as {
    profiles: Profile[];
    remaining: number;
  };

  return json({ profiles, remaining, user }, { headers });
}

export default function Index() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")!;
  const { profiles: searchedResults, user } = useLoaderData<typeof loader>();
  const [profiles, setProfiles] = useImmer<Profile[]>(searchedResults);
  const lastUserId = profiles[profiles.length - 1]?.id;

  const handleLoadMore = useCallback(({ profiles }: { profiles: Profile[] }) => {
    setProfiles((draft) => {
      draft.push(...profiles);
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center gap-y-6 py-6 w-full md:max-w-2xl mx-auto">
      {profiles.length > 0 ? (
        <>
          {profiles
            .filter((profile) => profile.username !== user?.username)
            .map((profile) => (
              <Link
                key={profile.username}
                to={`/profile/${profile.username}`}
                prefetch="intent"
                className="w-full flex-between gap-x-4"
              >
                <CldAvatar profile={profile} className="w-12 h-12" width={120} height={120} />
                <div className="flex-1 text-sm flex justify-between flex-col gap-y-1">
                  <p className="text-primary">{profile.username}</p>
                  <p className="text-inactive">{profile.name}</p>
                </div>
              </Link>
            ))}
          {lastUserId && (
            <InfiniteScrollTrigger
              loaderRoute={`/explore/users?q=${query}&last=${lastUserId}`}
              onLoad={handleLoadMore}
            />
          )}
        </>
      ) : (
        <div className="flex-1 flex-center py-6 w-full md:max-w-2xl mx-auto">No users found.</div>
      )}
    </div>
  );
}
