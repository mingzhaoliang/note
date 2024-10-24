import { prisma } from "@/lib/db/prisma.js";
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

type CreatePostArgs = {
  profileId: string;
  text: string;
  images: ImageSchema[] | undefined;
  tags: string[] | undefined;
};

const createPost = async ({ profileId, text, images, tags }: CreatePostArgs) => {
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

type getInfinitePostsArgs = {
  lastCursor?: string;
  take?: number;
};

const getFeed = async ({ lastCursor, take = 10 }: getInfinitePostsArgs) => {
  try {
    const posts = await prisma.post.findMany({
      take,
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

const findProfilePosts = async ({ profileId, lastCursor, take = 12 }: findProfilePostArgs) => {
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

const deletePost = async ({ postId }: { postId: string }) => {
  try {
    const deletedPost = await prisma.post.delete({ where: { id: postId } });

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

type CommentPostArgs = {
  postId: string;
  profileId: string;
  text: string;
  parentId: string | undefined;
};

const commentPost = async ({ postId, profileId, text, parentId }: CommentPostArgs) => {
  try {
    const postComment = await prisma.postComment.create({
      data: {
        profileId,
        postId,
        parentId: parentId ?? Prisma.skip,
        text,
      },
    });

    return postComment;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to comment the post.");
  }
};

const findPostComments = async ({
  postId,
  lastCursor,
  parentId,
  take = 10,
}: {
  postId: string;
  lastCursor?: string;
  parentId?: string;
  take?: number;
}) => {
  try {
    const comments = await prisma.postComment.findMany({
      take,
      ...(lastCursor && { skip: 1, cursor: { id: lastCursor } }),
      where: { postId, parentId: parentId ?? null },
      select: {
        id: true,
        postId: true,
        text: true,
        likes: { select: { profileId: true } },
        createdAt: true,
        profile: true,
        parentId: true,
        children: {
          select: {
            id: true,
            postId: true,
            text: true,
            likes: { select: { profileId: true } },
            createdAt: true,
            profile: true,
            parentId: true,
            _count: { select: { children: true } },
          },
        },
        _count: { select: { children: true } },
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
  commentPost,
  createPost,
  deletePost,
  findPost,
  findPostComments,
  findProfilePosts,
  getFeed,
  likePost,
  unLikePost,
};
