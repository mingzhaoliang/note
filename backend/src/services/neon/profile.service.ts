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

const getLikedPost = async (profileId: string, postId: string) => {
  try {
    const likedPost = await prisma.postLike.findUnique({
      where: { profileId_postId: { profileId, postId } },
    });

    return likedPost;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get liked posts.");
  }
};

export { findProfile, getLikedPost };
