import { prisma, Prisma } from "prisma/client.js";
async function create(data: { id: string; username: string; name: string }) {
  return await prisma.profile.create({ data });
}
const profileRepository = {
  create,
};

export default profileRepository;
