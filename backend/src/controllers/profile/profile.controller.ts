import { createProfileDto } from "@/lib/utils/createDto.js";
import { ProfileEditSchema } from "@/schemas/profile/profile-edit.schema.js";
import { deleteImage, uploadImage } from "@/services/apis/cloudinary.service.js";
import { findProfile, getProfile, updateProfile } from "@/services/neon/profile.service.js";
import { CloudinaryAsset } from "@/types/index.js";
import { Request, Response } from "express";
import fs from "fs";

const getProfileController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const profile = await getProfile({ username });

    if (!profile) {
      res.status(404).json("Profile not found.");
      return;
    }

    const profileDto = createProfileDto(profile);

    res.status(200).json({ profile: profileDto });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
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
      if (!profile) throw new Error("Profile not found.");

      let currentAvatar = profile.avatar;
      try {
        if (currentAvatar) await deleteImage(currentAvatar);

        if (
          !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(avatarImage.mimetype)
        ) {
          throw new Error("Invalid file type.");
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
    res.status(500).json("Internal server error.");
  }
};

const deleteAvatarController = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const profile = await findProfile({ id: profileId });
    if (!profile) throw new Error("Profile not found.");

    const { avatar } = profile;
    if (avatar) await deleteImage(avatar);

    const updatedProfile = await updateProfile({ profileId, avatar: null });
    res.status(200).json({ profile: updatedProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

export { deleteAvatarController, editProfileController, getProfileController };
