import { Prisma, prisma } from "@/prisma/client.js";
import { transformUndefined } from "@/utils/index.js";

async function create(data: { email: string; username: string; passwordHash?: string }) {
  return await prisma.user.create({
    data,
    omit: { passwordHash: true },
  });
}

async function findOne(conditions: Prisma.UserWhereUniqueInput) {
  const dbConditions = transformUndefined(conditions);

  return await prisma.user.findUnique({
    where: dbConditions,
    omit: { passwordHash: true },
  });
}

async function findOneWithPassword(conditions: Prisma.UserWhereUniqueInput) {
  const dbConditions = transformUndefined(conditions);

  return await prisma.user.findUnique({
    where: dbConditions,
  });
}

async function findById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    omit: { passwordHash: true },
  });
}

async function findByIdWithPassword(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

async function update(conditions: { id: string }, data: Prisma.UserUpdateInput) {
  const dbData = transformUndefined(data);

  return await prisma.user.update({
    where: conditions,
    data: dbData,
    omit: { passwordHash: true },
  });
}

async function deleteToBeDeleted() {
  const now = new Date();
  return await prisma.user.deleteMany({ where: { toBeDeletedAt: { lte: now } } });
}

const userRepository = {
  create,
  findOne,
  findOneWithPassword,
  findById,
  findByIdWithPassword,
  update,
  deleteToBeDeleted,
};

export default userRepository;
