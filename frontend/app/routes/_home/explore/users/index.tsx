import CldAvatar from "@/components/shared/cld-avatar";
import LoadMoreTrigger from "@/components/shared/load-more-trigger";
import envConfig from "@/config/env.config.server";
import { requireUser } from "@/session/guard.server";
import { addProfiles } from "@/store/redux/features/explore-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { Profile } from "@/types";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, redirect, useLoaderData, useSearchParams } from "@remix-run/react";
import { useCallback } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, headers } = await requireUser(request);

  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get("q");
  const lastUserId = searchParams.get("last");

  if (!q) {
    return redirect("/explore", { headers });
  }

  const response = await fetch(
    `${envConfig.API_URL}/profile/search?` +
      new URLSearchParams({ q, ...(lastUserId && { last: lastUserId }) }).toString()
  );

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const data = await response.json();
  const profiles: Profile[] = data.data;
  const count: number = data.count;

  return json({ profiles, count, user }, { headers });
}

export default function Index() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")!;
  const { count, user } = useLoaderData<typeof loader>();
  const profiles = useAppSelector((state) => state.explore.profiles);
  const last = profiles[profiles.length - 1]?.id;
  const dispatch = useAppDispatch();

  const handleLoadMore = useCallback(
    ({ profiles }: { profiles: Profile[] }) => {
      dispatch(addProfiles(profiles));
    },
    [dispatch]
  );

  return (
    <div className="flex-1 flex flex-col items-center gap-y-6 py-6 w-full md:max-w-2xl mx-auto">
      {profiles.map((profile) => (
        <Link
          key={profile.username}
          to={`/profile/${profile.username}`}
          prefetch="intent"
          className="w-full flex-between gap-x-4"
        >
          <CldAvatar
            avatar={profile.avatar}
            name={profile.name}
            className="w-12 h-12"
            width={120}
            height={120}
          />
          <div className="flex-1 text-sm flex justify-between flex-col gap-y-1">
            <p className="text-primary">{profile.username}</p>
            <p className="text-inactive">{profile.name}</p>
          </div>
        </Link>
      ))}
      {last && (
        <LoadMoreTrigger
          hasMore={count > profiles.length}
          nextPageUrl={`/explore/users?q=${query}&last=${last}`}
          onLoad={handleLoadMore}
        />
      )}
      {profiles.length === 0 && (
        <div className="flex-1 flex-center py-6 w-full md:max-w-2xl mx-auto">No users found.</div>
      )}
    </div>
  );
}
