import { prisma } from "@/lib/db/prisma.js";
import { CreateCommentSchema } from "@/schemas/post/create-comment.schema.js";
import { CreatePostSchema } from "@/schemas/post/create-post.schema.js";
import { ImageSchema } from "@/schemas/shared/image.schema.js";
import { Prisma } from "@prisma/client";

const basicPostSelect = {
  id: true,
  text: true,
  createdAt: true,
  profile: true,
  images: { select: { publicId: true } },
  tags: { select: { tag: { select: { name: true } } } },
  likes: { select: { profileId: true } },
  _count: { select: { comments: true } },
};

const createPost = async ({
  profileId,
  text,
  images,
  tags,
}: CreatePostSchema & { images: ImageSchema[] | undefined }) => {
  try {
    const post = await prisma.post.create({
      data: {
        profileId,
        text,
        images: {
          create:
            images?.map((image: any) => ({
              publicId: image.publicId,
              type: image.type,
              resourceType: image.resourceType,
              version: image.version,
            })) ?? Prisma.skip,
        },
        tags: {
          create:
            tags?.map((tag) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tag },
                  create: { name: tag },
                },
              },
            })) ?? Prisma.skip,
        },
      },
      select: basicPostSelect,
    });

    return post;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create the post.");
  }
};

const createComment = async ({ profileId, text, commentOnId }: CreateCommentSchema) => {
  try {
    const postComment = await prisma.post.create({
      data: {
        profileId,
        commentOnId: commentOnId ?? Prisma.skip,
        text,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        profile: true,
        commentOnId: true,
      },
    });

    return postComment;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to comment the post.");
  }
};

type getInfinitePostsArgs = {
  lastCursor?: string;
  take?: number;
};

const getFeedPosts = async ({ lastCursor, take = 10 }: getInfinitePostsArgs) => {
  try {
    const posts = await prisma.post.findMany({
      take,
      where: { commentOnId: null },
      ...(lastCursor && { skip: 1, cursor: { id: lastCursor } }),
      select: basicPostSelect,
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the posts.");
  }
};

type findProfilePostArgs = {
  profileId: string;
  lastCursor?: string;
  take?: number;
};

const getProfilePosts = async ({ profileId, lastCursor, take = 12 }: findProfilePostArgs) => {
  try {
    const posts = await prisma.post.findMany({
      take,
      ...(lastCursor && { skip: 1, cursor: { id: lastCursor } }),
      where: { profileId },
      select: {
        id: true,
        text: true,
        images: {
          select: {
            publicId: true,
          },
        },
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the posts.");
  }
};

const getProfileComments = async ({
  profileId,
  lastCursor,
  take = 10,
}: {
  profileId: string;
  lastCursor?: string;
  take?: number;
}) => {
  try {
    const comments = await prisma.post.findMany({
      where: { profileId, commentOnId: { not: null } },
      take,
      ...(lastCursor && { skip: 1, cursor: { id: lastCursor } }),
      select: {
        id: true,
        text: true,
        profile: true,
        likes: { select: { profileId: true } },
        commentOnId: true,
        commentOn: {
          select: {
            id: true,
            text: true,
            profile: true,
            commentOnId: true,
            commentOn: { select: { profile: { select: { username: true } } } },
            images: { select: { publicId: true } },
            tags: { select: { tag: { select: { name: true } } } },
            likes: { select: { profileId: true } },
            createdAt: true,
            _count: { select: { comments: true } },
          },
        },
        createdAt: true,
        _count: { select: { comments: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return comments;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get comments.");
  }
};

type PostActionArgs = {
  postId: string;
  profileId: string;
};

const likePost = async ({ postId, profileId }: PostActionArgs) => {
  try {
    const postLike = await prisma.postLike.create({
      data: {
        postId,
        profileId,
      },
    });

    return postLike;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to like the post.");
  }
};

const unLikePost = async ({ postId, profileId }: PostActionArgs) => {
  try {
    const postLike = await prisma.postLike.delete({
      where: {
        profileId_postId: {
          postId,
          profileId,
        },
      },
    });

    return postLike;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to unlike the post.");
  }
};

const deletePost = async ({ postId, profileId }: { postId: string; profileId: string }) => {
  try {
    const deletedPost = await prisma.post.delete({ where: { id: postId, profileId } });

    return deletedPost;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete the post.");
  }
};

const findPost = async (postId: string) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: basicPostSelect,
    });

    return post;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the post.");
  }
};

const getComment = async (commentId: string) => {
  try {
    const comment = await prisma.post.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        profile: true,
        text: true,
        likes: { select: { profileId: true } },
        commentOnId: true,
        createdAt: true,
        _count: { select: { comments: true } },
      },
    });

    return comment;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the comment.");
  }
};

const getComments = async ({
  commentOnId,
  lastCursor,
  take = 10,
}: {
  commentOnId: string;
  lastCursor?: string;
  take?: number;
}) => {
  try {
    const comments = await prisma.post.findMany({
      take,
      ...(lastCursor && { skip: 1, cursor: { id: lastCursor } }),
      where: { commentOnId },
      select: {
        id: true,
        profile: true,
        text: true,
        likes: { select: { profileId: true } },
        commentOnId: true,
        comments: {
          select: {
            id: true,
            profile: true,
            text: true,
            likes: { select: { profileId: true } },
            commentOnId: true,
            createdAt: true,
            _count: { select: { comments: true } },
          },
        },
        createdAt: true,
        _count: { select: { comments: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return comments;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the comments.");
  }
};

export {
  createComment,
  createPost,
  deletePost,
  findPost,
  getComment,
  getComments,
  getFeedPosts,
  getProfileComments,
  getProfilePosts,
  likePost,
  unLikePost,
};
