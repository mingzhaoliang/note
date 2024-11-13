import { prisma, Prisma } from "@/prisma/client.js";
import { transformUndefined } from "@/utils/index.js";

async function create(data: { id: string; userId: string; expiresAt: Date }) {
  return await prisma.session.create({ data });
}

async function findByIdWithUserProfile(id: string) {
  const result = await prisma.session.findUnique({
    where: { id, user: { OR: [{ toBeDeletedAt: null }, { toBeDeletedAt: { gt: new Date() } }] } },
    include: {
      user: {
        omit: { passwordHash: true },
        include: { profile: { include: { follower: true, following: true } } },
      },
    },
  });

  return result;
}

async function update(conditions: { id: string }, data: Prisma.SessionUpdateInput) {
  const dbData = transformUndefined(data);

  return await prisma.session.update({ where: conditions, data: dbData });
}

async function deleteById(id: string) {
  return await prisma.session.delete({ where: { id } });
}

async function deleteMany(conditions: { userId: string }) {
  return await prisma.session.deleteMany({ where: conditions });
}

const sessionRepository = {
  create,
  findByIdWithUserProfile,
  update,
  deleteById,
  deleteMany,
};

export default sessionRepository;
