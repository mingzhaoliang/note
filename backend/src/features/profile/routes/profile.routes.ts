import * as profileController from "@/features/profile/controllers/profile.controller.js";
import {
  profileEditSchema,
  profilePrivacySchema,
} from "@/features/profile/validation/profile.validation.js";
import { actionSchema } from "@/features/shared/validation/action.validation.js";
import { validateData } from "@/middleware/validation.js";
import { Router } from "express";

const router = Router();

router.get("/search", profileController.searchProfiles);
router.get("/:username", profileController.getProfile);
router.get("/:username/posts", profileController.getPosts);
router.get("/:username/comments", profileController.getComments);
router.get("/:username/followers", profileController.getFollowers);
router.get("/:username/following", profileController.getFollowing);

router.put("/:id", validateData(profileEditSchema), profileController.updateProfile);
router.delete("/:id/avatar", profileController.removeAvatar);

router.post("/:id/follow", validateData(actionSchema), profileController.followProfile);
router.post("/:id/unfollow", validateData(actionSchema), profileController.unfollowProfile);
router.put(
  "/:id/follow/confirm",
  validateData(actionSchema),
  profileController.confirmFollowRequest
);
router.put(
  "/:id/follow/decline",
  validateData(actionSchema),
  profileController.declineFollowRequest
);
router.post("/:id/unfollow", validateData(actionSchema), profileController.unfollowProfile);
router.put("/:id/privacy", validateData(profilePrivacySchema), profileController.updatePrivacy);

export default router;
