import { createPostController, getFeedController } from "@/controllers/post/post.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { createPostSchema } from "@/schemas/post/create-post.schema.js";
import { Router } from "express";

const router = Router();

router.post("/create", validateData(createPostSchema), createPostController);

router.get("/feed", getFeedController);

export default router;
