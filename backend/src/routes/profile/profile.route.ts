import { findProfilePostsController } from "@/controllers/post/post.controller.js";
import {
  deleteAvatarController,
  editProfileController,
  getProfileController,
} from "@/controllers/profile/profile.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { profileEditSchema } from "@/schemas/profile/profile-edit.schema.js";
import { Router } from "express";

const router = Router();

router.get("/:username/overview", getProfileController);

router.get("/:username/posts", findProfilePostsController);

router.put("/:profileId", validateData(profileEditSchema), editProfileController);

router.delete("/:profileId/avatar", deleteAvatarController);

export default router;
