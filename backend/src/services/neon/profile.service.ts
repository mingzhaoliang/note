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

const findProfileOverview = async (id: string) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        _count: {
          select: {
            posts: true,
            follower: true,
            following: true,
          },
        },
      },
    });

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

export { findProfile, findProfileOverview, getLikedPost };
