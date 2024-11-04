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
      where: { id: id ?? Prisma.skip, username: username ?? Prisma.skip },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        private: true,
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

const updatePrivacy = async ({
  profileId,
  isPrivate,
}: {
  profileId: string;
  isPrivate: boolean;
}) => {
  try {
    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: { private: isPrivate },
    });

    return profile;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update privacy.");
  }
};

const followProfile = async ({
  followingId,
  followerId,
}: {
  followingId: string;
  followerId: string;
}) => {
  try {
    await prisma.follows.create({
      data: {
        followingId,
        followerId,
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to follow profile.");
  }
};

const unfollowProfile = async ({
  followingId,
  followerId,
}: {
  followingId: string;
  followerId: string;
}) => {
  try {
    await prisma.follows.delete({
      where: { followerId_followingId: { followingId, followerId } },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to unfollow profile.");
  }
};

const searchProfiles = async ({
  q,
  last,
  take = 20,
}: {
  q: string;
  last?: string;
  take?: number;
}) => {
  try {
    const profilesPromise = prisma.profile.findMany({
      take,
      ...(last && { skip: 1, cursor: { id: last } }),
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        follower: { select: { followerId: true } },
        following: { select: { followingId: true } },
      },
    });

    const remainingPromise = prisma.profile
      .findMany({
        where: {
          OR: [{ username: { contains: q } }, { bio: { contains: q } }],
        },
        ...(last && { skip: 1, cursor: { id: last } }),
      })
      .then((profiles) => profiles.length);

    const [profiles, remaining] = await Promise.all([profilesPromise, remainingPromise]);

    return { profiles, remaining };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get posts by tag.");
  }
};

export {
  findProfile,
  followProfile,
  getLikedPost,
  getProfile,
  searchProfiles,
  unfollowProfile,
  updatePrivacy,
  updateProfile,
};
