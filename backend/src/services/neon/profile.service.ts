import { prisma } from "@/lib/db/prisma.js";

const findProfile = async (userId: string) => {
  try {
    const profile = await prisma.profile.findFirst({ where: { userId } });

    return profile;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the profile.");
  }
};

export { findProfile };
