import { prisma, Prisma } from "@/prisma/client.js";
import { transformUndefined } from "@/utils/index.js";
import { Profile } from "@prisma/client";

async function create(data: { id: string; username: string; name: string }) {
  return await prisma.profile.create({ data });
}

async function findById(id: string) {
  return await prisma.profile.findUnique({ where: { id } });
}

async function findOne(conditions: Prisma.ProfileWhereUniqueInput) {
  const dbConditions = transformUndefined(conditions);

  return await prisma.profile.findUnique({
    where: dbConditions,
    include: {
      _count: {
        select: {
          follower: { where: { status: "CONFIRMED" } },
          following: { where: { status: "CONFIRMED" } },
        },
      },
    },
  });
}

async function update(conditions: { id: string }, data: Prisma.ProfileUpdateInput) {
  const dbData = transformUndefined(data);

  return await prisma.profile.update({ where: conditions, data: dbData });
}

async function findMany(
  conditions: Prisma.ProfileWhereUniqueInput | object | undefined = {},
  options: {
    limit?: "all" | number;
    cursorId?: string;
    orderBy?: Prisma.ProfileOrderByWithRelationInput;
    search?: { contains: string; fields: (keyof Profile)[]; mode?: "insensitive" | "default" };
  } = {}
) {
  const { contains, fields, mode = "default" } = options.search || {};
  const dbConditions = {
    ...transformUndefined(conditions),
    ...(fields && { OR: fields.map((field) => ({ [field]: { contains, mode } })) }),
  };

  const limit = options.limit === "all" ? Prisma.skip : options.limit ?? 10;
  const cursor = options.cursorId === undefined ? Prisma.skip : { id: options.cursorId };
  const offset = cursor === Prisma.skip ? 0 : 1;
  const orderBy = options.orderBy ?? Prisma.skip;

  const rows = await prisma.profile.findMany({
    where: { user: { deactivated: false }, ...dbConditions },
    cursor,
    take: limit,
    skip: offset,
    orderBy,
  });

  const count = await prisma.profile.count({ where: dbConditions });

  return { rows, count };
}

const profileRepository = {
  create,
  findById,
  findOne,
  findMany,
  update,
};

export default profileRepository;
