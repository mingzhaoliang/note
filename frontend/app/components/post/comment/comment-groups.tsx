import { INITIAL_DISPLAY_COMMENTS } from "@/config/post.config";
import { Comment, User } from "@/types";
import { useCallback, useState } from "react";
import { Button } from "../../ui/button";
import PostComment from "./post-comment";

type CommentSectionProps = {
  comments: Comment[];
  user: User | null;
};

const CommentGroups = ({ comments, user }: CommentSectionProps) => {
  const [showMore, setShowMore] = useState(false);
  // Only grandchildren comments will be collapsed
  const hasMore = comments.length > INITIAL_DISPLAY_COMMENTS && comments[0].parentId;

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
          <div key={comment.id} className="flex flex-col gap-y-6">
            <PostComment profile={comment.profile} comment={comment} user={user} />
            {comment.childrenCount > 0 && comment.children && (
              <div className="ml-11 flex flex-col gap-y-6">
                <CommentGroups comments={comment.children} user={user} />
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
