import { Prisma, prisma } from "@/prisma/client.js";
import { transformUndefined } from "@/utils/index.js";
import { Notification } from "@prisma/client";

async function create(
  data: Pick<Notification, "notificationTypeId" | "senderId" | "recipientId" | "relatedId">
) {
  return await prisma.notification.create({ data });
}

async function findById(id: string) {
  return await prisma.notification.findUnique({
    where: { id, sender: { user: { deactivated: false } } },
    include: { type: true, sender: true },
  });
}

async function findMany(
  conditions: Partial<Notification>,
  options: {
    limit?: "all" | number;
    cursorId?: string;
    orderBy?: any;
  }
) {
  const dbConditions = transformUndefined(conditions);
  const where = {
    ...dbConditions,
    sender: { user: { deactivated: false } },
  };

  const limit = options.limit === "all" ? Prisma.skip : options.limit ?? 10;
  const cursor = options.cursorId === undefined ? Prisma.skip : { id: options.cursorId };
  const offset = cursor === Prisma.skip ? 0 : 1;
  const orderBy = options.orderBy ?? Prisma.skip;

  const rows = await prisma.notification.findMany({
    where,
    include: { type: true, sender: true },
    cursor,
    take: limit,
    skip: offset,
    orderBy,
  });

  const count = await prisma.notification.count({ where });

  return { rows, count };
}

async function updateMany(conditions: Partial<Notification>, data: Partial<Notification>) {
  const dbConditions = transformUndefined(conditions);
  const dbData = transformUndefined(data);

  return await prisma.notification.updateMany({ where: dbConditions, data: dbData });
}

async function deleteMany(
  conditions: Pick<Notification, "notificationTypeId" | "senderId" | "recipientId" | "relatedId">
) {
  return await prisma.notification.deleteMany({ where: conditions });
}

const notificationRepository = {
  create,
  findById,
  findMany,
  updateMany,
  deleteMany,
};

export default notificationRepository;
