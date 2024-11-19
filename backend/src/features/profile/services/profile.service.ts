import notificationRepository from "@/features/notification/repositories/notification.repository.js";
import { createNotificationDto } from "@/features/notification/services/notification.service.js";
import { deleteImage, uploadImage } from "@/features/shared/services/cloudinary.service.js";
import { getRecipientSocketId, io } from "@/socket/socket.js";
import fs from "fs";
import profileRepository from "../repositories/profile.repository.js";
import profileRelationshipRepository from "../repositories/profileRelationship.repository.js";

export async function getProfileByUsername(username: string) {
  const data = await profileRepository.findOne({ username });

  if (data === null) {
    return { success: false, message: "Profile not found", statusCode: 404 };
  }

  return { success: true, data, message: "ok", statusCode: 200 };
}

export async function updateProfile(body: {
  id: string;
  name: string;
  bio: string;
  avatarPath: string | undefined;
}) {
  const { id, name, bio, avatarPath } = body;

  let data;

  if (!avatarPath) {
    data = await profileRepository.update({ id }, { name, bio });
  } else {
    const profile = await profileRepository.findById(id);
    if (!profile) {
      return { success: false, message: "Profile not found", statusCode: 404 };
    }
    const existingAvatar = profile.avatar;

    if (existingAvatar) await deleteImage(existingAvatar);
    const { public_id } = await uploadImage(avatarPath, {
      folder: "/note/profile",
    });

    data = await profileRepository.update({ id }, { name, bio, avatar: public_id });

    fs.unlinkSync(avatarPath);
  }

  return { success: true, data, message: "ok", statusCode: 200 };
}

export async function removeAvatar(id: string) {
  const profile = await profileRepository.findById(id);
  if (!profile || !profile.avatar) {
    return { success: false, message: "Avatar not found", statusCode: 404 };
  }
  await deleteImage(profile.avatar);
  const data = await profileRepository.update({ id }, { avatar: null });

  return { success: true, data, message: "ok", statusCode: 200 };
}

export async function getProfiles(body: { search: string; last?: string }) {
  const { search, last } = body;

  const { rows, count } = await profileRepository.findMany(
    {},
    {
      limit: 5,
      cursorId: last,
      search: { contains: search, fields: ["username", "name", "bio"], mode: "insensitive" },
    }
  );

  return { success: true, data: rows, count };
}

export async function getFollowers(body: {
  username: string;
  last?: string;
  status?: "CONFIRMED" | "PENDING";
}) {
  const { username, last, status } = body;
  const profile = await profileRepository.findOne({ username });
  if (!profile) {
    return { success: false, message: "Profile not found", statusCode: 404 };
  }

  const toId = profile.id;
  const { rows, count } = await profileRelationshipRepository.findMany(
    { toId, status },
    { limit: 10, cursorId: last ? { fromId: last, toId } : undefined, type: "from" }
  );

  const rowsDto = rows.map(({ fromId, from, status }) => ({ id: fromId, profile: from, status }));

  return { success: true, data: rowsDto, count, message: "ok", statusCode: 200 };
}

export async function getFollowing(body: {
  username: string;
  last?: string;
  status?: "CONFIRMED" | "PENDING";
}) {
  const { username, last, status } = body;
  const profile = await profileRepository.findOne({ username });
  if (!profile) {
    return { success: false, message: "Profile not found", statusCode: 404 };
  }

  const fromId = profile.id;

  let { rows, count } = await profileRelationshipRepository.findMany(
    { fromId, status },
    { limit: 10, cursorId: last ? { fromId, toId: last } : undefined, type: "to" }
  );

  const rowsDto = rows.map(({ toId, to, status }) => ({ id: toId, profile: to, status }));

  return { success: true, data: rowsDto, count, message: "ok", statusCode: 200 };
}

export async function followProfile({ fromId, toId }: { fromId: string; toId: string }) {
  const profileToFollow = await profileRepository.findById(toId);
  if (!profileToFollow) {
    return { success: false, message: "Profile not found", statusCode: 404 };
  }

  const { rows: profileFollowers } = await profileRelationshipRepository.findMany(
    { toId, status: "CONFIRMED" },
    { limit: "all", type: "from" }
  );

  const isFollowing = profileFollowers.some(({ fromId: id }) => id === fromId);
  if (isFollowing) {
    return { success: false, message: "You are already following this user", statusCode: 400 };
  }
  const isPrivate = profileToFollow.private;
  const status = isPrivate ? "PENDING" : "CONFIRMED";
  const data = await profileRelationshipRepository.create({ fromId, toId, status });
  if (isPrivate) {
    notificationRepository
      .create({
        notificationTypeId: 5,
        senderId: fromId,
        recipientId: toId,
        relatedId: null,
      })
      .then(({ id }) => notificationRepository.findById(id))
      .then((notification) => {
        const dto = createNotificationDto(notification);
        const socketId = getRecipientSocketId(toId);
        if (socketId) {
          io.to(socketId).emit("notification:follow-request", { data: dto });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return { success: true, data, message: "ok", statusCode: 200 };
}

export async function unfollowProfile({ fromId, toId }: { fromId: string; toId: string }) {
  const data = await profileRelationshipRepository.deleteById(fromId, toId);
  notificationRepository
    .deleteMany({
      notificationTypeId: 5,
      senderId: fromId,
      recipientId: toId,
      relatedId: null,
    })
    .catch((error) => {
      console.error(error);
    });

  return { success: true, data, message: "ok", statusCode: 200 };
}

export const confirmFollowRequest = async ({ fromId, toId }: { fromId: string; toId: string }) => {
  const data = await profileRelationshipRepository.update(
    { fromId, toId },
    { status: "CONFIRMED" }
  );

  return { success: true, data };
};

export const declineFollowRequest = async ({ fromId, toId }: { fromId: string; toId: string }) => {
  const data = await profileRelationshipRepository.deleteById(fromId, toId);

  return { success: true, data };
};

export const updatePrivacy = async ({ id, isPrivate }: { id: string; isPrivate: boolean }) => {
  const data = await profileRepository.update({ id }, { private: isPrivate });

  if (data === null) {
    return { success: false, message: "Profile not found.", statusCode: 404 };
  }

  return { success: true, data, message: "ok", statusCode: 200 };
};
