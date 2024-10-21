import { findProfileOverviewController } from "@/controllers/profile/profile.controller.js";
import { Router } from "express";

const router = Router();

router.get("/overview/:profileId", findProfileOverviewController);

export default router;
