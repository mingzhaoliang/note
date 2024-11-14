import { prisma } from "@/prisma/client.js";
import { PasswordResetSession } from "@prisma/client";

async function create(
  data: Pick<
    PasswordResetSession,
    "id" | "userId" | "email" | "expiresAt" | "code" | "emailVerified"
  >
) {
  return await prisma.passwordResetSession.create({ data });
}

async function findById(id: string) {
  return await prisma.passwordResetSession.findUnique({ where: { id } });
}

async function update(conditions: { id: string }, data: { emailVerified: boolean }) {
  return await prisma.passwordResetSession.update({ where: conditions, data });
}

async function deleteById(id: string) {
  return await prisma.passwordResetSession.delete({ where: { id } });
}

async function deleteMany(userId: string) {
  return await prisma.passwordResetSession.deleteMany({ where: { userId } });
}

const passwordResetRepository = {
  create,
  findById,
  update,
  deleteById,
  deleteMany,
};

export default passwordResetRepository;
