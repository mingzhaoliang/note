import { prisma, Prisma } from "@/prisma/client.js";
import { transformUndefined } from "@/utils/index.js";
import { ProfileRelationship } from "@prisma/client";

async function create(data: Pick<ProfileRelationship, "fromId" | "toId" | "status">) {
  return await prisma.profileRelationship.create({ data });
}

async function findMany(
  conditions: Prisma.ProfileRelationshipWhereUniqueInput | object | undefined = {},
  options: {
    limit?: "all" | number;
    cursorId?: { fromId: string; toId: string };
    orderBy?: Prisma.ProfileRelationshipOrderByWithRelationInput;
    type: "from" | "to";
  }
) {
  const dbConditions = transformUndefined(conditions);
  const limit = options.limit === "all" ? Prisma.skip : options.limit ?? 10;
  const cursor = options.cursorId === undefined ? Prisma.skip : { fromId_toId: options.cursorId };
  const offset = cursor === Prisma.skip ? Prisma.skip : 1;
  const orderBy = options.orderBy ?? Prisma.skip;

  const where = {
    [options.type]: { user: { deactivated: false } },
    ...dbConditions,
  };

  const rows = await prisma.profileRelationship.findMany({
    where,
    include: { from: true, to: true },
    cursor,
    take: limit,
    skip: offset,
    orderBy,
  });

  const count = await prisma.profileRelationship.count({ where });

  return { rows, count };
}

async function update(
  conditions: { fromId: string; toId: string },
  data: Prisma.ProfileRelationshipUpdateInput
) {
  const dbData = transformUndefined(data);

  return await prisma.profileRelationship.update({
    where: { fromId_toId: conditions },
    data: dbData,
  });
}

async function deleteById(fromId: string, toId: string) {
  return await prisma.profileRelationship.delete({ where: { fromId_toId: { fromId, toId } } });
}

const profileRelationshipRepository = {
  create,
  findMany,
  update,
  deleteById,
};

export default profileRelationshipRepository;
