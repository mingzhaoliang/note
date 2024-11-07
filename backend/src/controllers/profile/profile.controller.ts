import { createProfileCommentDto, createProfileDto } from "@/lib/utils/createDto.js";
import { ProfileEditSchema } from "@/schemas/profile/profile-edit.schema.js";
import { ProfilePrivacySchema } from "@/schemas/profile/profile-privacy.schema.js";
import { ActionSchema } from "@/schemas/shared/action.schema.js";
import { deleteImage, uploadImage } from "@/services/apis/cloudinary.service.js";
import { getProfileComments, getProfilePosts } from "@/services/neon/post.service.js";
import {
  followProfile,
  getFollowers,
  getFollowing,
  getProfile,
  searchProfiles,
  unfollowProfile,
  updatePrivacy,
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
      res.status(404).end();
      return;
    }

    const profileDto = createProfileDto(profile);

    res.status(200).json({ profile: profileDto });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const editProfileController = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const { name, bio } = req.body as ProfileEditSchema;

    let profile;

    if (req.files) {
      const avatarImage = req.files.avatar as any;

      profile = await getProfile({ id: profileId });
      if (!profile) {
        res.status(404).end();
        return;
      }

      let currentAvatar = profile.avatar;
      try {
        if (currentAvatar) await deleteImage(currentAvatar);

        if (
          !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(avatarImage.mimetype)
        ) {
          res.status(400).json({ message: "Invalid file type." });
          return;
        }

        const { public_id } = (await uploadImage(avatarImage.tempFilePath, {
          folder: "/note/profile",
        })) as CloudinaryAsset;

        currentAvatar = public_id;
        profile = await updateProfile({
          profileId,
          name,
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
        bio,
      });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const deleteAvatarController = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const profile = await getProfile({ id: profileId });
    if (!profile) {
      res.status(404).end();
      return;
    }

    const { avatar } = profile;
    if (avatar) await deleteImage(avatar);

    const updatedProfile = await updateProfile({ profileId, avatar: null });
    res.status(200).json({ profile: updatedProfile });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const followProfileController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { profileId } = req.body as ActionSchema;

    const profileToFollow = await getProfile({ id: profileId });
    if (!profileToFollow) {
      res.status(404).end();
      return;
    }

    const isFollowing = profileToFollow.follower.some(({ fromId }) => fromId === id);
    let relationship;
    if (isFollowing) {
      relationship = await unfollowProfile({ fromId: id, toId: profileToFollow.id });
    } else if (profileToFollow.private) {
      relationship = await followProfile({ fromId: id, toId: profileToFollow.id });
    } else {
      relationship = await followProfile({
        fromId: id,
        toId: profileToFollow.id,
        status: "CONFIRMED",
      });
    }

    res.status(200).json({ relationship });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const confirmRequestController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { profileId } = req.body as ActionSchema;
    const relationship = await followProfile({ fromId: profileId, toId: id, status: "CONFIRMED" });
    res.status(200).json({ relationship });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const declineRequestController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { profileId } = req.body as ActionSchema;
    const relationship = await unfollowProfile({ fromId: profileId, toId: id });
    res.status(200).json({ relationship });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const getProfilePostsController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { lastPostId } = req.query as { lastPostId: string | undefined };

    const profile = await getProfile({ username });
    if (!profile) {
      res.status(404).end();
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
    res.status(500).end();
  }
};

const getProfileCommentsController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { lastCommentId } = req.query as { lastCommentId: string | undefined };
    const profile = await getProfile({ username });
    if (!profile) {
      res.status(404).end();
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
    res.status(500).end();
  }
};

const searchProfilesController = async (req: Request, res: Response) => {
  try {
    const { q, last } = req.query as { q: string; last: string };
    const { profiles, remaining } = await searchProfiles({ q, last });
    res.status(200).json({ profiles, remaining });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const updatePrivacyController = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const { isPrivate } = req.body as ProfilePrivacySchema;
    const updatedProfile = await updatePrivacy({ profileId, isPrivate });
    res.status(200).json({ profile: updatedProfile });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const getFollowersController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { last, status = "CONFIRMED" } = req.query as {
      last: string | undefined;
      status: "CONFIRMED" | "PENDING" | undefined;
    };
    const profile = await getProfile({ username });
    if (!profile) {
      res.status(404).end();
      return;
    }

    const { followers, remaining } = await getFollowers({
      id: profile.id,
      last,
      status,
    });
    res.status(200).json({ relationships: followers, remaining });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

const getFollowingController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { last, userId } = req.query as { last: string | undefined; userId: string | undefined };
    const profile = await getProfile({ username });
    if (!profile) {
      res.status(404).end();
      return;
    }

    const { following, remaining } = await getFollowing({
      id: profile.id,
      last,
      status: "CONFIRMED",
    });
    res.status(200).json({ relationships: following, remaining });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

export {
  confirmRequestController,
  declineRequestController,
  deleteAvatarController,
  editProfileController,
  followProfileController,
  getFollowersController,
  getFollowingController,
  getProfileCommentsController,
  getProfileController,
  getProfilePostsController,
  searchProfilesController,
  updatePrivacyController,
};
