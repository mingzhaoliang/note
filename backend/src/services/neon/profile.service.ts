import { prisma } from "@/lib/db/prisma.js";
import { ProfileEditSchema } from "@/schemas/profile/profile-edit.schema.js";
import { Prisma } from "@prisma/client";

const getProfile = async ({ id, username }: { id?: string; username?: string }) => {
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
        follower: { select: { fromId: true, status: true } },
        following: { select: { toId: true, status: true } },
        _count: {
          select: {
            follower: { where: { status: "CONFIRMED" } },
            following: { where: { status: "CONFIRMED" } },
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
  fromId,
  toId,
  status = "PENDING",
}: {
  fromId: string;
  toId: string;
  status?: "CONFIRMED" | "PENDING";
}) => {
  try {
    const relationship = await prisma.relationship.upsert({
      where: { fromId_toId: { fromId, toId } },
      update: { status },
      create: { fromId, toId, status },
      select: {
        from: true,
        to: true,
        status: true,
      },
    });

    return relationship;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to follow profile.");
  }
};

const unfollowProfile = async ({ fromId, toId }: { fromId: string; toId: string }) => {
  try {
    const relationship = await prisma.relationship.delete({
      where: { fromId_toId: { fromId, toId } },
      select: {
        from: true,
        to: true,
        status: true,
      },
    });

    return relationship;
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
        follower: { where: { status: "CONFIRMED" }, select: { fromId: true } },
        following: { where: { status: "CONFIRMED" }, select: { toId: true } },
      },
    });

    const remainingPromise = prisma.profile
      .findMany({
        where: {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { bio: { contains: q, mode: "insensitive" } },
          ],
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
  followProfile,
  getLikedPost,
  getProfile,
  searchProfiles,
  unfollowProfile,
  updatePrivacy,
  updateProfile,
};
