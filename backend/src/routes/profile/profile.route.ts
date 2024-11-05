import {
  deleteAvatarController,
  editProfileController,
  followProfileController,
  getProfileCommentsController,
  getProfileController,
  getProfilePostsController,
  searchProfilesController,
  updatePrivacyController,
} from "@/controllers/profile/profile.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { profileEditSchema } from "@/schemas/profile/profile-edit.schema.js";
import { profilePrivacySchema } from "@/schemas/profile/profile-privacy.schema.js";
import { actionSchema } from "@/schemas/shared/action.schema.js";
import { Router } from "express";

const router = Router();

router.get("/explore", searchProfilesController);

router.get("/:username/overview", getProfileController);

router.get("/:username/posts", getProfilePostsController);

router.get("/:username/comments", getProfileCommentsController);

router.put("/:id/follow", validateData(actionSchema), followProfileController);

router.put("/:profileId", validateData(profileEditSchema), editProfileController);

router.put("/:profileId/privacy", validateData(profilePrivacySchema), updatePrivacyController);

router.delete("/:profileId/avatar", deleteAvatarController);

export default router;
