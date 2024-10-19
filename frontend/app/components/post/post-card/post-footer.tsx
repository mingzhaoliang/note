import LoginModal from "@/components/auth/login-modal";
import { Comment, Like, LikeFilled } from "@/components/icons";
import { Slot } from "@radix-ui/react-slot";
import { useFetcher } from "@remix-run/react";

type PostFooterProps = {
  postId: string;
  userId?: string | null;
  likes: string[];
  commentCount: number;
};

const PostFooter = ({ postId, userId, likes, commentCount }: PostFooterProps) => {
  const hasLiked = userId ? likes.includes(userId) : false;

  return (
    <div className="mt-6 flex items-center gap-x-2">
      {userId && (
        <>
          <PostLike postId={postId} hasLiked={hasLiked} count={likes.length} />
          <Comment className="text-inactive w-5 h-5" />
        </>
      )}
      {!userId && (
        <>
          <PostStats count={likes.length}>
            <Like />
          </PostStats>
          <PostStats count={commentCount}>
            <Comment />
          </PostStats>
        </>
      )}
    </div>
  );
};

type PostStatsProps = {
  count: number;
};

const PostStats = ({ children, count }: React.PropsWithChildren<PostStatsProps>) => {
  return (
    <div className="flex items-center space-x-2">
      <LoginModal>
        <Slot className="text-inactive w-5 h-5">{children}</Slot>
      </LoginModal>
      <div className="min-w-3">{count > 0 && <p className="text-inactive text-sm">{count}</p>}</div>
    </div>
  );
};

type PostLikeProps = {
  postId: string;
  hasLiked: boolean;
  count: number;
};

const PostLike = ({ postId, hasLiked, count }: PostLikeProps) => {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.formData?.get("_action") === "like";

  const Icon = (isSubmitting ? !hasLiked : hasLiked) ? LikeFilled : Like;
  const updatedCount = isSubmitting ? (hasLiked ? count - 1 : count + 1) : count;

  return (
    <div className="flex items-center space-x-2">
      <fetcher.Form method="POST" action="/?index" className="flex-center">
        <input type="hidden" name="postId" value={postId} />
        <button type="submit" name="_action" value="like">
          <Icon className="text-inactive w-5 h-5" />
        </button>
      </fetcher.Form>
      <div className="min-w-3">
        {updatedCount > 0 && <p className="text-inactive text-sm">{updatedCount}</p>}
      </div>
    </div>
  );
};

export default PostFooter;
