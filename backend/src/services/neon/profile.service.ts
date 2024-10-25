import { prisma } from "@/lib/db/prisma.js";
import { ProfileEditSchema } from "@/schemas/profile/profile-edit.schema.js";
import { Prisma } from "@prisma/client";

type FindProfileArgs = {
  id?: string;
  username?: string;
};

const findProfile = async ({ id, username }: FindProfileArgs) => {
  try {
    if (!id && !username) {
      throw new Error("Either 'id' or 'username' must be provided.");
    }

    const profile = await prisma.profile.findUnique({
      where: { id: id ?? Prisma.skip, username: username ?? Prisma.skip },
    });

    return profile;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get the profile.");
  }
};

const getProfile = async ({ id, username }: FindProfileArgs) => {
  try {
    if (!id && !username) {
      throw new Error("Either 'id' or 'username' must be provided.");
    }

    const profile = await prisma.profile.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        follower: { select: { followerId: true } },
        following: { select: { followingId: true } },
        _count: {
          select: {
            posts: true,
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

const updateProfile = async ({
  profileId,
  name,
  username,
  bio,
  avatar,
}: Partial<ProfileEditSchema> & { profileId: string; avatar?: string | null }) => {
  try {
    if (username) {
      await prisma.user.update({
        where: { id: profileId },
        data: { username },
      });
    }

    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: {
        name: name !== undefined ? name : Prisma.skip,
        bio: bio !== undefined ? bio : Prisma.skip,
        avatar: avatar !== undefined ? avatar : Prisma.skip,
      },
    });

    return profile;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to remove avatar.");
  }
};

export { findProfile, getProfile, getLikedPost, updateProfile };
