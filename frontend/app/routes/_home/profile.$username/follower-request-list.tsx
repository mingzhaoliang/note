import { ProfileListItem, ProfileListItemSkeleton } from "@/components/profile/profile-list-item";
import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import {
  setFollowerRequests,
  setRemainingFollowerRequests,
} from "@/store/redux/features/relationship-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { Relationship } from "@/types";
import { useFetcher, useParams } from "@remix-run/react";
import { useCallback, useEffect } from "react";
import { loader } from "./$relationship";

const FollowerRequestList = () => {
  const fetcher = useFetcher<typeof loader>();
  const followerRequests = useAppSelector((state) => state.relationship.followerRequests);
  const remaining = useAppSelector((state) => state.relationship.remainingFollowerRequests);
  const { username } = useParams();
  const lastFollowerRequestId = followerRequests[followerRequests.length - 1]?.profile.id;
  const dispatch = useAppDispatch();

  const handleLoadMore = useCallback(
    ({ relationships, remaining }: { relationships: Relationship[]; remaining: number }) => {
      dispatch(setFollowerRequests(relationships));
      dispatch(setRemainingFollowerRequests(remaining));
    },
    [dispatch, setFollowerRequests, setRemainingFollowerRequests]
  );

  useEffect(() => {
    fetcher.load(`/profile/${username}/followers?status=PENDING`);
  }, [fetcher.load, username]);

  useEffect(() => {
    if (!fetcher.data || fetcher.state !== "idle") return;
    dispatch(setFollowerRequests(fetcher.data.relationships));
  }, [fetcher.data?.relationships, fetcher.state, dispatch, setFollowerRequests]);

  console.log("fetcher.data", fetcher.data);

  return (
    <div className="flex flex-col gap-y-6">
      {followerRequests.length === 0 && fetcher.state === "loading" && <ProfileListItemSkeleton />}
      {followerRequests.length === 0 && fetcher.state === "idle" && (
        <div className="flex-center h-12">You don't have any follower requests.</div>
      )}
      {followerRequests.map((request) => (
        <ProfileListItem key={request.profile.id} profile={request.profile} isFollowRequest />
      ))}
      {lastFollowerRequestId && remaining > 0 && (
        <InfiniteScrollTrigger
          loaderRoute={`/profile/${username}/followers?status=PENDING&last=${lastFollowerRequestId}`}
          onLoad={handleLoadMore}
        />
      )}
    </div>
  );
};

export default FollowerRequestList;
