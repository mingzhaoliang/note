import { prisma, Prisma } from "@/prisma/client.js";
import { Message } from "@prisma/client";

async function create(data: Pick<Message, "conversationId" | "senderId" | "text">) {
  return await prisma.message.create({ data });
}

async function findMany(
  conditions: { conversationId: string },
  options: {
    limit?: "all" | number;
    cursorId?: string;
    orderBy?: Prisma.MessageOrderByWithRelationInput;
  } = {}
) {
  const limit = options.limit === "all" ? Prisma.skip : options.limit ?? 10;
  const cursor = options.cursorId === undefined ? Prisma.skip : { id: options.cursorId };
  const offset = cursor === Prisma.skip ? 0 : 1;
  const orderBy = options.orderBy ?? Prisma.skip;

  const where = { conversationId: conditions.conversationId };

  const rows = await prisma.message.findMany({
    where,
    include: { sender: true },
    take: limit,
    skip: offset,
    cursor,
    orderBy,
  });

  const count = await prisma.message.count({ where });

  return { rows, count };
}

async function updateMany(conditions: Partial<Message>, data: Prisma.MessageUpdateInput) {
  return await prisma.message.updateMany({ where: conditions, data });
}

const messageRepository = {
  create,
  findMany,
  updateMany,
};

export default messageRepository;
