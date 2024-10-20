import { prisma } from "@/lib/db/prisma.js";
import { ImageSchema } from "@/schemas/shared/image.schema.js";
import { Prisma } from "@prisma/client";

type CreatePostArgs = {
  profileId: string;
  text: string;
  images: ImageSchema[] | undefined;
  tags: string[] | undefined;
  createdAt: Date;
};

const createPost = async ({ profileId, text, images, tags, createdAt }: CreatePostArgs) => {
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
        createdAt,
      },
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
      select: {
        id: true,
        text: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        images: {
          select: {
            publicId: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
        likes: {
          select: {
            profileId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
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
    throw new Error("Failed to cancel like the post.");
  }
};

const deletePost = async ({ postId, profileId }: PostActionArgs) => {
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
      select: {
        id: true,
        text: true,
        updatedAt: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        images: {
          select: {
            publicId: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
        likes: {
          select: {
            profileId: true,
          },
        },
        comments: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            profile: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
            parentId: true,
          },
        },
      },
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
  createdAt: Date;
};

const commentPost = async ({ postId, profileId, text, parentId, createdAt }: CommentPostArgs) => {
  try {
    const postComment = await prisma.postComment.create({
      data: {
        profileId,
        postId,
        parentId: parentId ?? Prisma.skip,
        text,
        createdAt,
      },
    });

    return postComment;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to comment the post.");
  }
};

export { commentPost, createPost, deletePost, findPost, getFeed, likePost, unLikePost };
