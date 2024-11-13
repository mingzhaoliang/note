import { prisma } from "@/prisma/client.js";

async function create(data: { providerId: string; providerUserId: string; userId: string }) {
  return await prisma.account.create({ data });
}

async function findById(providerId: string, providerUserId: string) {
  return await prisma.account.findUnique({
    where: { providerId_providerUserId: { providerId, providerUserId } },
  });
}

const accountRepository = {
  create,
  findById,
};

export default accountRepository;
