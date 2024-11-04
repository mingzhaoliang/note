import { getConversation } from "@/services/neon/conversation.service.js";
import { findPost, getComment, getProfileComments } from "@/services/neon/post.service.js";
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
    private: profile.private,
    follower: profile.follower.map(({ followerId }) => followerId),
    following: profile.following.map(({ followingId }) => followingId),
    postCount: profile._count.posts,
  };
};

const createProfileCommentDto = (
  comment: Awaited<ReturnType<typeof getProfileComments>>["comments"][number]
) => {
  if (!comment) {
    return null;
  }
  return {
    id: comment.id,
    text: comment.text,
    profile: comment.profile,
    likes: comment.likes.map(({ profileId }) => profileId),
    commentOnId: comment.commentOnId,
    commentOn: {
      id: comment.commentOn!.id,
      text: comment.commentOn!.text,
      profile: comment.commentOn!.profile,
      commentOnId: comment.commentOn!.commentOnId,
      commentOnUsername: comment.commentOn!.commentOn?.profile.username,
      images: comment.commentOn!.images.map(({ publicId }) => publicId),
      tags: comment.commentOn!.tags.map(({ tag: { name } }) => name),
      likes: comment.commentOn!.likes.map(({ profileId }) => profileId),
      createdAt: comment.commentOn!.createdAt,
      commentCount: comment.commentOn!._count.comments,
    },
    createdAt: comment.createdAt,
    commentCount: comment._count.comments,
  };
};

const createConversationDto = (
  conversation: (Awaited<ReturnType<typeof getConversation>> & { messages?: any[] }) | null
) => {
  if (!conversation) {
    return null;
  }
  return {
    id: conversation.id,
    participants: conversation.participants.map(({ profile }) => profile),
    lastMessage: conversation.messages?.[0] || null,
  };
};

export {
  createCommentDto,
  createConversationDto,
  createPostDto,
  createProfileCommentDto,
  createProfileDto,
};
