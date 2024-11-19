import notificationRepository from "@/features/notification/repositories/notification.repository.js";
import { createNotificationDto } from "@/features/notification/services/notification.service.js";
import profileRepository from "@/features/profile/repositories/profile.repository.js";
import { uploadImage } from "@/features/shared/services/cloudinary.service.js";
import { getRecipientSocketId, io } from "@/socket/socket.js";
import fs from "fs";
import postRepository from "../repositories/post.repository.js";

function createPostDto(row: any): any {
  return {
    ...row,
    profile: {
      id: row.profileId,
      username: row.profile?.username,
      name: row.profile?.name,
      avatar: row.profile?.avatar,
    },
    images: row.images?.map(({ publicId }: any) => publicId),
    tags: row.tags?.map(({ tag }: any) => tag.name),
    likes: row.likes?.map(({ profileId }: any) => profileId),
    ...(row.parent && { parent: createPostDto(row.parent) }),
    ...(row.comments && { comments: row.comments?.map((comment: any) => createPostDto(comment)) }),
  };
}

export async function getPost(id: string) {
  const row = await postRepository.findById(id);

  if (row === null) {
    return { success: false, message: "Post not found", statusCode: 404 };
  }

  const data = createPostDto(row);

  return { success: true, data, message: "ok", statusCode: 200 };
}

export async function likeUnlikePost({ postId, profileId }: { postId: string; profileId: string }) {
  const post = await postRepository.findById(postId);
  if (!post) {
    return { success: false, message: "Post not found", statusCode: 404 };
  }
  const hasLiked = post.likes.some((like) => like.profileId === profileId);

  let data;
  if (hasLiked) {
    data = await postRepository.unlike(postId, profileId);
    if (post.profileId !== profileId) {
      const notificationTypeId = post.parentId === null ? 1 : 2;
      notificationRepository.deleteMany({
        notificationTypeId,
        senderId: profileId,
        recipientId: post.profileId,
        relatedId: postId,
      });
    }
  } else {
    data = await postRepository.like(postId, profileId);
    if (post.profileId !== profileId) {
      const notificationTypeId = post.parentId === null ? 1 : 2;
      notificationRepository
        .create({
          notificationTypeId,
          senderId: profileId,
          recipientId: post.profileId,
          relatedId: postId,
        })
        .then(({ id }) => notificationRepository.findById(id))
        .then((notification) => {
          const dto = createNotificationDto(notification);
          const socketId = getRecipientSocketId(post.profileId);
          if (socketId) {
            io.to(socketId).emit("notification:like", { data: dto });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  return { success: true, data, message: "ok", statusCode: 200 };
}

export async function createPost(body: {
  profileId: string;
  text: string;
  imagePaths: string[];
  tags: string[];
}) {
  const { profileId, text, imagePaths, tags } = body;
  const imagesPromise = imagePaths.map(async (imagePath) => {
    const { public_id, resource_type, type, version } = await uploadImage(imagePath, {
      folder: "/note/post",
    }).finally(() => {
      fs.unlinkSync(imagePath);
    });

    return { publicId: public_id, resourceType: resource_type, type, version };
  });

  const images = await Promise.all(imagesPromise);

  const { id } = await postRepository.create({
    profileId,
    parentId: null,
    text,
    images,
    tags,
  });

  const row = await postRepository.findById(id);
  const data = createPostDto(row);

  return { success: true, data };
}

export async function createComment(body: { profileId: string; text: string; parentId: string }) {
  const { profileId, text, parentId } = body;
  const { id } = await postRepository.create({
    profileId,
    parentId,
    text,
  });

  const row = await postRepository.findById(id);
  const data = createPostDto(row);

  if (row!.profileId !== profileId) {
    const notificationTypeId = row!.parentId === null ? 3 : 4;
    notificationRepository
      .create({
        notificationTypeId,
        senderId: profileId,
        recipientId: row!.profileId,
        relatedId: row!.id,
      })
      .then(({ id }) => notificationRepository.findById(id))
      .then((notification) => {
        const dto = createNotificationDto(notification);
        const socketId = getRecipientSocketId(row!.profileId);
        if (socketId) {
          io.to(socketId).emit("notification:like", { data: dto });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return { success: true, data };
}

export async function getPosts(body: { search?: string; last?: string; profileId?: string }) {
  const { search, last, profileId } = body;
  const { rows, count } = await postRepository.findPosts(
    { profileId, parentId: null },
    {
      limit: 5,
      cursorId: last,
      orderBy: { createdAt: "desc" },
      search: search ? { searchKey: search, mode: "insensitive" } : undefined,
    }
  );

  const data = rows.map(createPostDto);

  return { success: true, data, count };
}

export async function getPostsByProfile({ username, last }: { username: string; last?: string }) {
  const profile = await profileRepository.findOne({ username });
  if (!profile) {
    return { success: false, message: "Profile not found", statusCode: 404 };
  }

  const profileId = profile.id;
  const { rows, count } = await postRepository.findPostsByProfile(
    { profileId, parentId: null },
    {
      limit: 10,
      cursorId: last,
      orderBy: { createdAt: "desc" },
    }
  );

  const data = rows.map(createPostDto);

  return { success: true, data, count, message: "ok", statusCode: 200 };
}

export async function deletePost({ postId, profileId }: { postId: string; profileId: string }) {
  const data = await postRepository.deleteById(postId, profileId);
  return { success: true, data };
}

export async function getPostComments({ parentId, last }: { parentId: string; last?: string }) {
  const { rows, count } = await postRepository.findComments(
    { parentId },
    {
      limit: 5,
      cursorId: last,
      orderBy: { createdAt: "desc" },
    }
  );

  const data = rows.map(createPostDto);

  return { success: true, data, count };
}

export async function getCommentsByProfile({
  username,
  last,
}: {
  username: string;
  last?: string;
}) {
  const profile = await profileRepository.findOne({ username });
  if (!profile) {
    return { success: false, message: "Profile not found", statusCode: 404 };
  }

  const profileId = profile.id;
  const { rows, count } = await postRepository.findCommentsByProfile(
    { profileId },
    {
      limit: 10,
      cursorId: last,
      orderBy: {
        createdAt: "desc",
      },
    }
  );

  const data = rows.map(createPostDto);

  return { success: true, data, count, message: "ok", statusCode: 200 };
}
