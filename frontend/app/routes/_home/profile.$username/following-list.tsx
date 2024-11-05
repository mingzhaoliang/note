import { ProfileListItem, ProfileListItemSkeleton } from "@/components/profile/profile-list-item";
import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import { setFollowing, setRemainingFollowing } from "@/store/redux/features/relationship-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { Relationship } from "@/types";
import { useFetcher, useParams } from "@remix-run/react";
import { useCallback, useEffect } from "react";
import { loader } from "./$relationship";

const FollowingList = () => {
  const fetcher = useFetcher<typeof loader>();
  const following = useAppSelector((state) => state.relationship.following);
  const remaining = useAppSelector((state) => state.relationship.remainingFollowing);
  const { username } = useParams();
  const lastFollowerId = following[following.length - 1]?.profile.id;
  const dispatch = useAppDispatch();

  const handleLoadMore = useCallback(
    ({ relationships, remaining }: { relationships: Relationship[]; remaining: number }) => {
      dispatch(setFollowing(relationships));
      dispatch(setRemainingFollowing(remaining));
    },
    [dispatch]
  );

  useEffect(() => {
    fetcher.load(`/profile/${username}/following`);
  }, [username]);

  useEffect(() => {
    if (!fetcher.data || fetcher.state !== "idle") return;
    dispatch(setFollowing(fetcher.data.relationships));
  }, [fetcher.data?.relationships, fetcher.state, dispatch]);

  return (
    <div className="flex flex-col gap-y-6">
      {following.length === 0 && fetcher.state === "loading" && <ProfileListItemSkeleton />}
      {following.length === 0 && fetcher.state === "idle" && (
        <div className="flex-center h-12">{username} is not following anyone.</div>
      )}
      {following.map((following) => (
        <ProfileListItem key={following.profile.id} profile={following.profile} />
      ))}
      {lastFollowerId && remaining > 0 && (
        <InfiniteScrollTrigger
          loaderRoute={`/profile/${username}/following?last=${lastFollowerId}`}
          onLoad={handleLoadMore}
        />
      )}
    </div>
  );
};

export default FollowingList;
