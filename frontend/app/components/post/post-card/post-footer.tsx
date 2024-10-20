import LoginModal from "@/components/auth/login-modal";
import { Comment, Like, LikeFilled } from "@/components/icons";
import { useFeed } from "@/store/feed.context";
import { Slot } from "@radix-ui/react-slot";
import { useFetcher } from "@remix-run/react";
import PostComment from "./post-comment";

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
          <PostLike userId={userId} postId={postId} hasLiked={hasLiked} count={likes.length} />
          <PostComment postId={postId} count={commentCount} />
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
  userId: string;
  postId: string;
  hasLiked: boolean;
  count: number;
};

const PostLike = ({ userId, postId, hasLiked, count }: PostLikeProps) => {
  const fetcher = useFetcher();
  const { setPosts } = useFeed();

  const Icon = hasLiked ? LikeFilled : Like;

  const onSubmit = () => {
    setPosts((draft) => {
      const targetPost = draft.find((post) => post.id === postId);
      if (targetPost) {
        hasLiked
          ? targetPost.likes.splice(targetPost.likes.indexOf(userId), 1)
          : targetPost.likes.push(userId);
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <fetcher.Form method="POST" action="/?index" className="flex-center" onSubmit={onSubmit}>
        <input type="hidden" name="postId" value={postId} />
        <button type="submit" name="_action" value="like">
          <Icon className="text-inactive w-5 h-5" />
        </button>
      </fetcher.Form>
      <div className="min-w-3">{count > 0 && <p className="text-inactive text-sm">{count}</p>}</div>
    </div>
  );
};

export default PostFooter;
