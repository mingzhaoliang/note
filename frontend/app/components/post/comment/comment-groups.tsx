import { Button } from "@/components/ui/button";
import { INITIAL_DISPLAY_COMMENTS } from "@/config/post.config";
import { Comment, User } from "@/types";
import { Link, useLocation } from "@remix-run/react";
import { useCallback, useState } from "react";
import CommentItem from "./comment-item";

type CommentSectionProps = {
  comments: Comment[];
  user: User | null;
};

const CommentGroups = ({ comments, user }: CommentSectionProps) => {
  const [showMore, setShowMore] = useState(false);
  // Only grandchildren comments will be collapsed
  const hasMore = comments.length > INITIAL_DISPLAY_COMMENTS && comments[0].parentId;
  const location = useLocation();

  const handleShowMore = useCallback(() => {
    setShowMore(true);
  }, []);

  const handleCollapse = useCallback(() => {
    setShowMore(false);
  }, []);

  return (
    <>
      {comments.map((comment, index) => {
        if (index + 1 > INITIAL_DISPLAY_COMMENTS && !showMore && comment.parentId) {
          return null;
        }
        return (
          <div key={comment.id} className="flex flex-col gap-y-3">
            <Link
              to={`/profile/${comment.profile.username}/post/${comment.id}`}
              state={{ referrer: location.pathname }}
            >
              <CommentItem profile={comment.profile} comment={comment} user={user} />
            </Link>
            {comment._count.comments > 0 && comment.comments && (
              <div className="ml-10 flex flex-col gap-y-3">
                <CommentGroups comments={comment.comments} user={user} />
              </div>
            )}
          </div>
        );
      })}
      {hasMore && (
        <Button
          variant="ghost"
          className="-mt-2 !w-fit !h-fit p-1 text-muted-foreground"
          onClick={showMore ? handleCollapse : handleShowMore}
        >
          {showMore ? "Collapse" : "More"}
        </Button>
      )}
    </>
  );
};

export default CommentGroups;
