import {
  createPostController,
  deletePostController,
  getFeedController,
  likePostController,
} from "@/controllers/post/post.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { createPostSchema } from "@/schemas/post/create-post.schema.js";
import { postActionSchema } from "@/schemas/post/post-action.schema.js";
import { Router } from "express";

const router = Router();

router.post("/create", validateData(createPostSchema), createPostController);

router.get("/feed", getFeedController);

router.post("/like", validateData(postActionSchema), likePostController);

router.post("/delete", validateData(postActionSchema), deletePostController);

export default router;
