import {
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

router.get("/:username/followers", getFollowersController);

router.get("/:username/following", getFollowingController);

router.put("/:id/follow", validateData(actionSchema), followProfileController);

router.put("/:id/follow/confirm", validateData(actionSchema), confirmRequestController);

router.put("/:id/follow/decline", validateData(actionSchema), declineRequestController);

router.put("/:profileId", validateData(profileEditSchema), editProfileController);

router.put("/:profileId/privacy", validateData(profilePrivacySchema), updatePrivacyController);

router.delete("/:profileId/avatar", deleteAvatarController);

export default router;
