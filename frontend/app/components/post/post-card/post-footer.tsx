import LoginModal from "@/components/auth/login-modal";
import { Comment, Like } from "@/components/icons";
import { Slot } from "@radix-ui/react-slot";
import PostComment from "./post-comment";
import PostLikes from "./post-likes";

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
          <PostLikes postId={postId} hasLiked={hasLiked} count={likes.length} />
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

export default PostFooter;
