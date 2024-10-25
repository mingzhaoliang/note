import { findPost, getComment } from "@/services/neon/post.service.js";
import { getProfile } from "@/services/neon/profile.service.js";

const createPostDto = (post: Awaited<ReturnType<typeof findPost>>) => {
  if (!post) {
    return null;
  }
  const postDto = {
    ...post,
    tags: post.tags.map(({ tag: { name } }) => name),
    images: post.images.map(({ publicId }) => publicId),
    likes: post.likes.map(({ profileId }) => profileId),
    commentCount: post._count.comments,
  };

  return postDto;
};

type Comment = Awaited<ReturnType<typeof getComment>> & { comments?: Comment[] };

type CommentDto = {
  id: string;
  profile: any;
  text: string;
  likes: string[];
  commentOnId: string | null;
  commentCount: number;
  comments?: CommentDto[];
  createdAt: Date;
} | null;

const createCommentDto = (comment: Comment): CommentDto => {
  if (!comment) {
    return null;
  }

  return {
    id: comment.id,
    profile: comment.profile,
    text: comment.text,
    likes: comment.likes.map(({ profileId }) => profileId),
    commentOnId: comment.commentOnId,
    commentCount: comment._count.comments,
    comments: comment.comments?.map(createCommentDto),
    createdAt: comment.createdAt,
  };
};

const createProfileDto = (profile: Awaited<ReturnType<typeof getProfile>>) => {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    username: profile.username,
    name: profile.name,
    avatar: profile.avatar,
    bio: profile.bio,
    follower: profile.follower.map(({ followerId }) => followerId),
    following: profile.following.map(({ followingId }) => followingId),
    postCount: profile._count.posts,
  };
};

export { createCommentDto, createPostDto, createProfileDto };
