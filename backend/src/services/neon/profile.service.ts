import { prisma } from "@/lib/db/prisma.js";

const findProfile = async (id: string) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { id } });

    return profile;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the profile.");
  }
};

export { findProfile };
