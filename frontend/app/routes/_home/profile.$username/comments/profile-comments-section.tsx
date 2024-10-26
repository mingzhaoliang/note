import InfiniteScrollTrigger from "@/components/shared/infinite-scroll-trigger";
import { Separator } from "@/components/ui/separator";
import { ProfileComment } from "@/types";
import { useParams } from "@remix-run/react";
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

  const handleNewProfileComments = useCallback((newComments: ProfileComment[] | null) => {
    if (!newComments) return;
    setProfileComments((draft) => {
      draft.push(...newComments);
    });
  }, []);

  return (
    <>
      <div>
        {profileComments.map((comment, index) => (
          <div key={comment.id} className="flex flex-col">
            {index > 0 && <Separator className="mt-4 mb-6" />}
            <CommentOnItem {...comment.commentOn} setProfileComments={setProfileComments} />
            <CommentItem {...comment} setProfileComments={setProfileComments} />
          </div>
        ))}
      </div>
      {lastCommentId && (
        <InfiniteScrollTrigger
          loaderRoute={`/profile/${username}/comments?index&lastCommentId=${lastCommentId}`}
          onLoad={handleNewProfileComments}
          className="!mt-12"
        />
      )}
    </>
  );
}
