import { createProfileCommentDto, createProfileDto } from "@/lib/utils/createDto.js";
import { ProfileEditSchema } from "@/schemas/profile/profile-edit.schema.js";
import { ProfileFollowSchema } from "@/schemas/profile/profile-follow.schema.js";
import { deleteImage, uploadImage } from "@/services/apis/cloudinary.service.js";
import { getProfileComments, getProfilePosts } from "@/services/neon/post.service.js";
import {
  findProfile,
  followProfile,
  getProfile,
  searchProfiles,
  unfollowProfile,
  updateProfile,
} from "@/services/neon/profile.service.js";
import { CloudinaryAsset } from "@/types/index.js";
import { Request, Response } from "express";
import fs from "fs";

const getProfileController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const profile = await getProfile({ username });

    if (!profile) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }

    const profileDto = createProfileDto(profile);

    res.status(200).json({ profile: profileDto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const editProfileController = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const { name, username, bio } = req.body as ProfileEditSchema;

    let profile;

    if (req.files) {
      const avatarImage = req.files.avatar as any;

      let profile = await findProfile({ id: profileId });
      if (!profile) {
        res.status(404).json({ error: "Profile not found." });
        return;
      }

      let currentAvatar = profile.avatar;
      try {
        if (currentAvatar) await deleteImage(currentAvatar);

        if (
          !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(avatarImage.mimetype)
        ) {
          res.status(400).json({ error: "Invalid file type." });
          return;
        }

        const { public_id } = (await uploadImage(avatarImage.tempFilePath, {
          folder: "/note/profile",
        })) as CloudinaryAsset;

        currentAvatar = public_id;
        profile = await updateProfile({
          profileId,
          name,
          username,
          bio,
          avatar: currentAvatar,
        });
      } catch (error) {
        throw error;
      } finally {
        fs.unlinkSync(avatarImage.tempFilePath);
      }
    } else {
      profile = await updateProfile({
        profileId,
        name,
        username,
        bio,
      });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const deleteAvatarController = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const profile = await findProfile({ id: profileId });
    if (!profile) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }

    const { avatar } = profile;
    if (avatar) await deleteImage(avatar);

    const updatedProfile = await updateProfile({ profileId, avatar: null });
    res.status(200).json({ profile: updatedProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const followProfileController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username } = req.body as ProfileFollowSchema;

    const profileToFollow = await getProfile({ username });
    if (!profileToFollow) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }

    const isFollowing = profileToFollow.follower.some(({ followerId }) => followerId === id);
    if (isFollowing) {
      await unfollowProfile({ followingId: profileToFollow.id, followerId: id });
    } else {
      await followProfile({ followingId: profileToFollow.id, followerId: id });
    }

    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getProfilePostsController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { lastPostId } = req.query as { lastPostId: string | undefined };

    const profile = await getProfile({ username });
    if (!profile) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }
    const { posts, remainingPosts } = await getProfilePosts({
      profileId: profile.id,
      lastCursor: lastPostId,
    });

    const postsDto = posts.map((post) => ({
      ...post,
      images: post.images.map(({ publicId }) => publicId),
    }));
    res.status(200).json({ posts: postsDto, remaining: remainingPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getProfileCommentsController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { lastCommentId } = req.query as { lastCommentId: string | undefined };
    const profile = await getProfile({ username });
    if (!profile) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }
    const { comments, remainingComments } = await getProfileComments({
      profileId: profile.id,
      lastCursor: lastCommentId,
    });

    const profileCommentsDto = comments.map((comment) => createProfileCommentDto(comment));

    res.status(200).json({ comments: profileCommentsDto, remaining: remainingComments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const searchProfilesController = async (req: Request, res: Response) => {
  try {
    const { q, last } = req.query as { q: string; last: string };
    const { profiles, remaining } = await searchProfiles({ q, last });
    res.status(200).json({ profiles, remaining });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export {
  deleteAvatarController,
  editProfileController,
  followProfileController,
  getProfileCommentsController,
  getProfileController,
  getProfilePostsController,
  searchProfilesController,
};
