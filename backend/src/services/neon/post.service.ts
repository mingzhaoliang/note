import { prisma } from "@/lib/db/prisma.js";
import { ImageSchema } from "@/schemas/shared/image.schema.js";
import { Prisma } from "@prisma/client";

type CreatePostArgs = {
  profileId: string;
  text: string;
  images: ImageSchema[] | undefined;
  tags: string[] | undefined;
};

const createPost = async ({ profileId, text, images, tags }: CreatePostArgs) => {
  try {
    await prisma.post.create({
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
    });
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

export { createPost, getFeed };
