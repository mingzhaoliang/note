import { Badge } from "@/components/ui/badge";
import { postDateFormat } from "@/lib/utils/formatter";
import { Post } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import PostDropdown from "./post-dropdown";
import PostFooter from "./post-footer";
import PostImages from "./post-images";

type PostCardProps = Post & {
  userId?: string | null;
};

const PostCard = ({
  userId,
  id: postId,
  images,
  text,
  tags,
  profile,
  likes,
  createdAt,
  commentCount,
}: PostCardProps) => {
  const isOwner = userId === profile.id;

  return (
    <div className="w-full flex space-x-3">
      <div className="flex-center flex-col pb-8">
        <Avatar>
          <AvatarImage src={profile.avatar} />
          <AvatarFallback>{profile.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 border-l border-muted" />
      </div>
      <div className="w-full flex flex-col space-y-4">
        <div className="py-1 flex-between gap-3">
          <p className="text-sm flex-center gap-3">
            <span className="font-semibold">{profile.username}</span>
            <span className="text-muted-foreground">{postDateFormat(createdAt)}</span>
          </p>
          <PostDropdown isOwner={isOwner} postId={postId} />
        </div>
        {images.length > 0 && <PostImages images={images} />}
        <div className="flex items-center flex-wrap gap-2">
          <p className="text-foreground">{text}</p>
          {tags.map((tag, index) => (
            <Badge key={tag + index} variant="secondary" className="rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
        <PostFooter postId={postId} userId={userId} likes={likes} commentCount={commentCount} />
      </div>
    </div>
  );
};

export default PostCard;
