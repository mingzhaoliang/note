import { prisma, Prisma } from "@/prisma/client.js";

async function create(profileIds: string[]) {
  return await prisma.conversation.create({
    data: {
      participants: {
        create: profileIds.map((profileId) => ({ profileId })),
      },
    },
  });
}

async function findById(id: string) {
  return await prisma.conversation.findUnique({
    where: { id },
    include: { participants: { include: { profile: true } } },
  });
}

async function findOneByParticipants(profileIds: string[]) {
  return await prisma.conversation.findFirst({
    where: {
      participants: {
        every: { profileId: { in: profileIds } },
      },
    },
  });
}
async function findMany(
  conditions: { profileId: string },
  options: {
    limit?: "all" | number;
    cursorId?: string;
    orderBy?: Prisma.ConversationOrderByWithRelationInput;
  } = {}
) {
  const limit = options.limit === "all" ? Prisma.skip : options.limit ?? 10;
  const cursor = options.cursorId === undefined ? Prisma.skip : { id: options.cursorId };
  const offset = cursor === Prisma.skip ? 0 : 1;
  const orderBy = options.orderBy ?? Prisma.skip;

  const where = { participants: { some: { profileId: conditions.profileId } } };

  const rows = await prisma.conversation.findMany({
    where,
    include: {
      participants: { select: { profile: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    take: limit,
    skip: offset,
    cursor,
    orderBy,
  });

  const count = await prisma.conversation.count({ where });

  return { rows, count };
}

async function update(conditions: { id: string }, data: Prisma.ConversationUpdateInput) {
  return await prisma.conversation.update({
    where: conditions,
    data,
    include: { participants: { select: { profileId: true } } },
  });
}

const conversationRepository = {
  create,
  findById,
  findOneByParticipants,
  findMany,
  update,
};

export default conversationRepository;
