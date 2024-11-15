import { Prisma, prisma } from "@/prisma/client.js";
import { transformUndefined } from "@/utils/index.js";
import { Post, PostImage } from "@prisma/client";

async function create(
  data: Pick<Post, "profileId" | "text" | "parentId"> & {
    images?: Pick<PostImage, "publicId" | "resourceType" | "type" | "version">[];
    tags?: string[];
  }
) {
  const { images, tags, ...rest } = data;
  return await prisma.post.create({
    data: {
      ...rest,
      images: {
        create: images ?? Prisma.skip,
      },
      tags: {
        create:
          tags?.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })) ?? Prisma.skip,
      },
    },
  });
}

async function findById(id: string) {
  return await prisma.post.findUnique({
    where: { id, profile: { user: { deactivated: false } } },
    include: {
      profile: true,
      images: true,
      tags: { include: { tag: true } },
      likes: true,
      _count: {
        select: {
          likes: { where: { profile: { user: { deactivated: false } } } },
          comments: { where: { profile: { user: { deactivated: false } } } },
        },
      },
    },
  });
}

async function findOne(conditions: Prisma.PostWhereUniqueInput) {
  const dbConditions = transformUndefined(conditions);
  const where = {
    profile: { user: { deactivated: false } },
    ...dbConditions,
  };

  return await prisma.post.findUnique({
    where,
    include: {
      profile: true,
      images: true,
      tags: { include: { tag: true } },
      likes: true,
      _count: {
        select: {
          likes: { where: { profile: { user: { deactivated: false } } } },
          comments: { where: { profile: { user: { deactivated: false } } } },
        },
      },
    },
  });
}

async function findMany<T extends Prisma.PostInclude>(
  where: Prisma.PostWhereInput = {},
  include: T = {} as T,
  options: {
    limit?: "all" | number;
    cursorId?: string;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  } = {}
) {
  const limit = options.limit === "all" ? Prisma.skip : options.limit ?? 10;
  const cursor = options.cursorId === undefined ? Prisma.skip : { id: options.cursorId };
  const offset = cursor === Prisma.skip ? 0 : 1;
  const orderBy = options.orderBy ?? Prisma.skip;

  const rows = await prisma.post.findMany({
    where,
    include,
    cursor,
    take: limit,
    skip: offset,
    orderBy,
  });

  const count = await prisma.post.count({ where });

  return { rows, count };
}

async function findPosts(
  conditions: { parentId?: string | null; profileId?: string } | undefined = {},
  options: {
    limit?: "all" | number;
    cursorId?: string;
    orderBy?: Prisma.PostOrderByWithRelationInput;
    search?: { searchKey: string; mode?: "insensitive" | "default" };
  } = {}
) {
  const baseConditions = {
    parentId: conditions.parentId === undefined ? Prisma.skip : conditions.parentId,
  };

  const getSearchConditions = (search?: {
    searchKey: string;
    mode?: "insensitive" | "default";
  }) => {
    if (!search) return {};

    const { searchKey, mode = "default" } = search;
    return {
      OR: [
        { text: { contains: searchKey, mode } },
        { tags: { some: { tag: { name: { contains: searchKey, mode } } } } },
      ],
    };
  };

  const where = {
    ...baseConditions,
    ...getSearchConditions(options.search),
  };

  const include = {
    profile: true,
    images: true,
    tags: { include: { tag: true } },
    likes: true,
    _count: {
      select: {
        likes: { where: { profile: { user: { deactivated: false } } } },
        comments: { where: { profile: { user: { deactivated: false } } } },
      },
    },
  };

  return await findMany(where, include, options);
}

async function findPostsByProfile(
  conditions: { parentId?: string | null; profileId?: string } | undefined = {},
  options: {
    limit?: "all" | number;
    cursorId?: string;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  } = {}
) {
  const where = transformUndefined(conditions);
  const include = {
    profile: true,
    images: true,
    tags: { include: { tag: true } },
    likes: true,
    _count: {
      select: {
        likes: { where: { profile: { user: { deactivated: false } } } },
        comments: { where: { profile: { user: { deactivated: false } } } },
      },
    },
  };

  return await findMany(where, include, options);
}

async function findComments(
  conditions: { parentId?: string | null; profileId?: string } | undefined = {},
  options: {
    limit?: "all" | number;
    cursorId?: string;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  } = {}
) {
  const where = {
    profileId: conditions.profileId === undefined ? Prisma.skip : conditions.profileId,
    parentId: conditions.parentId === undefined ? { not: null } : conditions.parentId,
  };

  const includeFields = {
    profile: true,
    images: true,
    tags: { include: { tag: true } },
    likes: true,
    _count: {
      select: {
        likes: { where: { profile: { user: { deactivated: false } } } },
        comments: { where: { profile: { user: { deactivated: false } } } },
      },
    },
  };

  const include = {
    ...includeFields,
    comments: {
      where: { profile: { user: { deactivated: false } } },
      include: includeFields,
    },
  };

  return await findMany(where, include, options);
}

async function findCommentsByProfile(
  conditions: { parentId?: string | null; profileId?: string } | undefined = {},
  options: {
    limit?: "all" | number;
    cursorId?: string;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  } = {}
) {
  const where = {
    profileId: conditions.profileId === undefined ? Prisma.skip : conditions.profileId,
    parentId: conditions.parentId === undefined ? { not: null } : conditions.parentId,
  };

  const includeFields = {
    profile: true,
    images: true,
    tags: { include: { tag: true } },
    likes: true,
    _count: {
      select: {
        likes: { where: { profile: { user: { deactivated: false } } } },
        comments: { where: { profile: { user: { deactivated: false } } } },
      },
    },
  };

  const include = {
    ...includeFields,
    parent: {
      where: { profile: { user: { deactivated: false } } },
      include: { ...includeFields, parent: { select: { profile: true } } },
    },
  };

  return await findMany(where, include, options);
}

async function like(postId: string, profileId: string) {
  return await prisma.post.update({
    where: { id: postId },
    data: {
      likes: { create: { profileId } },
    },
  });
}

async function unlike(postId: string, profileId: string) {
  return await prisma.post.update({
    where: { id: postId },
    data: {
      likes: { delete: { profileId_postId: { profileId, postId } } },
    },
  });
}

async function deleteById(id: string, profileId: string) {
  return await prisma.post.delete({ where: { id, profileId } });
}

const postRepository = {
  create,
  findById,
  findOne,
  findPosts,
  findComments,
  findPostsByProfile,
  findCommentsByProfile,
  deleteById,
  like,
  unlike,
};

export default postRepository;
