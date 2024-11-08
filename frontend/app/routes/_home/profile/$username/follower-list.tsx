import { ProfileListItem, ProfileListItemSkeleton } from "@/components/profile/profile-list-item";
import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import { setFollowers, setRemainingFollowers } from "@/store/redux/features/relationship-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { Relationship } from "@/types";
import { useFetcher, useParams } from "@remix-run/react";
import { useCallback, useEffect } from "react";
import { loader } from "./$relationship";

const FollowerList = () => {
  const fetcher = useFetcher<typeof loader>();
  const followers = useAppSelector((state) => state.relationship.followers);
  const remaining = useAppSelector((state) => state.relationship.remainingFollowers);
  const { username } = useParams();
  const lastFollowerId = followers[followers.length - 1]?.profile.id;
  const dispatch = useAppDispatch();

  const handleLoadMore = useCallback(
    ({ relationships, remaining }: { relationships: Relationship[]; remaining: number }) => {
      dispatch(setFollowers(relationships));
      dispatch(setRemainingFollowers(remaining));
    },
    [dispatch]
  );

  useEffect(() => {
    fetcher.load(`/profile/${username}/followers?status=CONFIRMED`);
  }, [username]);

  useEffect(() => {
    if (!fetcher.data || fetcher.state !== "idle") return;
    dispatch(setFollowers(fetcher.data.relationships));
  }, [fetcher.data?.relationships, fetcher.state, dispatch]);

  return (
    <div className="flex flex-col gap-y-6">
      {followers.length === 0 && fetcher.state === "loading" && <ProfileListItemSkeleton />}
      {followers.length === 0 && fetcher.state === "idle" && (
        <div className="flex-center h-12">{username} has no followers.</div>
      )}
      {followers.map((follower) => (
        <ProfileListItem key={follower.profile.id} profile={follower.profile} />
      ))}
      {lastFollowerId && remaining > 0 && (
        <InfiniteScrollTrigger
          loaderRoute={`/profile/${username}/followers?status=CONFIRMED&last=${lastFollowerId}`}
          onLoad={handleLoadMore}
        />
      )}
    </div>
  );
};

export default FollowerList;
