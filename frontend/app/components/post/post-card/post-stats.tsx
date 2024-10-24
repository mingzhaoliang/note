import LoginModal from "@/components/auth/login-modal";
import { Slot } from "@radix-ui/react-slot";

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

export default PostStats;
