import {
  deleteAvatarController,
  editProfileController,
  findProfileOverviewController,
} from "@/controllers/profile/profile.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { profileEditSchema } from "@/schemas/profile/profile-edit.schema.js";
import { Router } from "express";

const router = Router();

router.get("/overview/:username", findProfileOverviewController);

router.put("/:profileId", validateData(profileEditSchema), editProfileController);

router.delete("/:profileId/avatar", deleteAvatarController);

export default router;