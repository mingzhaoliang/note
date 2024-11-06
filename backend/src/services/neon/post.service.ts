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
  likes: { where: { profile: { deactivated: false } }, select: { profileId: true } },
  _count: { select: { comments: { where: { profile: { deactivated: false } } } } },
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

const getFeedPosts = async ({
  take = 20,
  last,
  userId,
}: {
  take?: number;
  last?: string;
  userId?: string;
}) => {
  try {
    const postsPromise = prisma.post.findMany({
      take,
      where: {
        commentOnId: null,
        profile: {
          deactivated: false,
          OR: [
            { private: false },
            { private: true, follower: { some: { fromId: userId ?? Prisma.skip } } },
          ],
        },
      },
      ...(last && { skip: 1, cursor: { id: last } }),
      select: basicPostSelect,
      orderBy: { createdAt: "desc" },
    });

    const remainingPromise = prisma.post
      .findMany({
        where: {
          commentOnId: null,
          profile: {
            deactivated: false,
            OR: [
              { private: false },
              { private: true, follower: { some: { fromId: userId ?? Prisma.skip } } },
            ],
          },
        },
        ...(last && { skip: take + 1, cursor: { id: last } }),
        orderBy: { createdAt: "desc" },
      })
      .then((posts) => posts.length);

    const [posts, remaining] = await Promise.all([postsPromise, remainingPromise]);

    return { posts, remaining };
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
    const postsPromise = prisma.post.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    const remainingPostsPromise = prisma.post
      .findMany({
        where: { profileId },
        ...(lastCursor && { skip: take + 1, cursor: { id: lastCursor } }),
        orderBy: { createdAt: "desc" },
      })
      .then((posts) => posts.length);

    const [posts, remainingPosts] = await Promise.all([postsPromise, remainingPostsPromise]);

    return { posts, remainingPosts };
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
    const commentsPromise = prisma.post.findMany({
      where: { profileId, commentOnId: { not: null } },
      take,
      ...(lastCursor && { skip: 1, cursor: { id: lastCursor } }),
      select: {
        id: true,
        text: true,
        profile: true,
        likes: { where: { profile: { deactivated: false } }, select: { profileId: true } },
        commentOnId: true,
        commentOn: {
          where: { profile: { deactivated: false } },
          select: {
            id: true,
            text: true,
            profile: true,
            commentOnId: true,
            commentOn: { select: { profile: { select: { username: true } } } },
            images: { select: { publicId: true } },
            tags: { select: { tag: { select: { name: true } } } },
            likes: { where: { profile: { deactivated: false } }, select: { profileId: true } },
            createdAt: true,
            _count: { select: { comments: { where: { profile: { deactivated: false } } } } },
          },
        },
        createdAt: true,
        _count: { select: { comments: { where: { profile: { deactivated: false } } } } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const remainingCommentsPromise = prisma.post
      .findMany({
        where: { profileId, commentOnId: { not: null } },
        ...(lastCursor && { skip: take + 1, cursor: { id: lastCursor } }),
        orderBy: { createdAt: "desc" },
      })
      .then((comments) => comments.length);

    const [comments, remainingComments] = await Promise.all([
      commentsPromise,
      remainingCommentsPromise,
    ]);

    return { comments, remainingComments };
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
      where: { id: postId, profile: { deactivated: false } },
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
      where: { id: commentId, profile: { deactivated: false } },
      select: {
        id: true,
        profile: true,
        text: true,
        likes: { where: { profile: { deactivated: false } }, select: { profileId: true } },
        commentOnId: true,
        createdAt: true,
        _count: { select: { comments: { where: { profile: { deactivated: false } } } } },
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
      where: { commentOnId, profile: { deactivated: false } },
      select: {
        id: true,
        profile: true,
        text: true,
        likes: { where: { profile: { deactivated: false } }, select: { profileId: true } },
        commentOnId: true,
        comments: {
          where: { profile: { deactivated: false } },
          select: {
            id: true,
            profile: true,
            text: true,
            likes: { where: { profile: { deactivated: false } }, select: { profileId: true } },
            commentOnId: true,
            createdAt: true,
            _count: { select: { comments: { where: { profile: { deactivated: false } } } } },
          },
        },
        createdAt: true,
        _count: { select: { comments: { where: { profile: { deactivated: false } } } } },
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

const searchPosts = async ({
  q,
  last,
  take = 10,
  userId,
}: {
  q: string;
  last?: string;
  take?: number;
  userId?: string;
}) => {
  try {
    const postsPromise = prisma.post.findMany({
      take,
      ...(last && { skip: 1, cursor: { id: last } }),
      where: {
        OR: [
          { text: { contains: q, mode: "insensitive" } },
          { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
        ],
        profile: {
          deactivated: false,
          OR: [
            { private: false },
            { private: true, follower: { some: { fromId: userId ?? Prisma.skip } } },
          ],
        },
      },
      select: basicPostSelect,
      orderBy: { createdAt: "desc" },
    });

    const remainingPromise = prisma.post
      .findMany({
        where: {
          OR: [
            { text: { contains: q, mode: "insensitive" } },
            { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
          ],
          profile: {
            deactivated: false,
            OR: [
              { private: false },
              { private: true, follower: { some: { fromId: userId ?? Prisma.skip } } },
            ],
          },
        },
        ...(last && { skip: take + 1, cursor: { id: last } }),
        orderBy: { createdAt: "desc" },
      })
      .then((posts) => posts.length);

    const [posts, remaining] = await Promise.all([postsPromise, remainingPromise]);

    return { posts, remaining };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get posts by tag.");
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
  searchPosts,
  unLikePost,
};
