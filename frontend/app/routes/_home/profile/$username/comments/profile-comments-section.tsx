import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/store/context/session.context";
import { ProfileComment } from "@/types";
import { Link, useParams } from "@remix-run/react";
import { useCallback } from "react";
import { useImmer } from "use-immer";
import CommentItem from "./comment-item";
import CommentOnItem from "./comment-on-item";

type ProfilePostsSectionProps = {
  comments: ProfileComment[];
};

export default function ProfileCommentsSection({ comments }: ProfilePostsSectionProps) {
  const [profileComments, setProfileComments] = useImmer(comments);
  const lastCommentId = profileComments[profileComments.length - 1]?.id;
  const { username } = useParams();
  const { user } = useSession();
  const isOwner = user?.username === username;

  const handleLoadProfileComments = useCallback(({ comments }: { comments: ProfileComment[] }) => {
    if (!comments) return;
    setProfileComments((draft) => {
      draft.push(...comments);
    });
  }, []);

  return (
    <>
      {profileComments.length === 0 && (
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
      {profileComments.length > 0 && (
        <div>
          {profileComments.map((comment, index) => (
            <div key={comment.id} className="flex flex-col">
              {index > 0 && <Separator className="mt-4 mb-6" />}
              <CommentOnItem {...comment.commentOn} setProfileComments={setProfileComments} />
              <CommentItem {...comment} setProfileComments={setProfileComments} />
            </div>
          ))}
        </div>
      )}
      {profileComments.length > 0 && lastCommentId && (
        <InfiniteScrollTrigger
          loaderRoute={`/profile/${username}/comments?index&lastCommentId=${lastCommentId}`}
          onLoad={handleLoadProfileComments}
          className="my-4"
        />
      )}
    </>
  );
}
