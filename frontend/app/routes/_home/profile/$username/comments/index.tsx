import LoadMoreTrigger from "@/components/shared/load-more-trigger";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import envConfig from "@/config/env.config.server";
import { requireUser } from "@/session/guard.server";
import { addComments } from "@/store/redux/features/profile-slice";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { ProfileComment } from "@/types";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { useCallback } from "react";
import CommentItem from "./comment-item";
import CommentParent from "./comment-parent";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { user, headers } = await requireUser(request);
  const { username } = params;

  const last = new URL(request.url).searchParams.get("last");

  const response = await fetch(
    `${envConfig.API_URL}/profile/${username}/comments${last ? `?last=${last}` : ""}`
  );

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const data = await response.json();
  const comments: ProfileComment[] = data.data;
  const count: number = data.count;

  return json({ comments, count, user }, { headers });
}

export default function Index() {
  const { count, user } = useLoaderData<typeof loader>();
  const { username } = useParams();
  const isOwner = user?.username === username;
  const comments = useAppSelector((state) => state.profile.comments);
  const dispatch = useAppDispatch();
  const last = comments[comments.length - 1]?.id;

  const handleLoadMore = useCallback(
    ({ comments }: { comments: ProfileComment[] }) => {
      dispatch(addComments(comments));
    },
    [dispatch]
  );

  return (
    <div className="w-full flex flex-col gap-y-4">
      {comments.length === 0 && (
        <div className="py-6 flex-center flex-col">
          {isOwner ? (
            <>
              <p className="mb-6">You haven&apos;t commented yet.</p>
              <Button variant="outline" asChild>
                <Link to="/">Explore the community</Link>
              </Button>
            </>
          ) : (
            <p className="mb-6">This user hasn&apos;t commented yet.</p>
          )}
        </div>
      )}
      {comments.map((comment, index) => (
        <div key={comment.id} className="flex flex-col">
          {index > 0 && <Separator className="mt-4 mb-6" />}
          <CommentParent {...comment.parent} />
          <CommentItem {...comment} />
        </div>
      ))}
      {last && (
        <LoadMoreTrigger
          hasMore={count > comments.length}
          nextPageUrl={`/profile/${username}?index&last=${last}`}
          onLoad={handleLoadMore}
        />
      )}
    </div>
  );
}
