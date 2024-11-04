import {
  deleteAvatarController,
  editProfileController,
  followProfileController,
  getProfileCommentsController,
  getProfileController,
  getProfilePostsController,
  searchProfilesController,
} from "@/controllers/profile/profile.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { profileEditSchema } from "@/schemas/profile/profile-edit.schema.js";
import { profileFollowSchema } from "@/schemas/profile/profile-follow.schema.js";
import { Router } from "express";

const router = Router();

router.get("/explore", searchProfilesController);

router.get("/:username/overview", getProfileController);

router.get("/:username/posts", getProfilePostsController);

router.get("/:username/comments", getProfileCommentsController);

router.put("/:id/follow", validateData(profileFollowSchema), followProfileController);

router.put("/:profileId", validateData(profileEditSchema), editProfileController);

router.delete("/:profileId/avatar", deleteAvatarController);

export default router;
