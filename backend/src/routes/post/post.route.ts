import {
  commentPostController,
  createPostController,
  deletePostController,
  findPostController,
  getFeedController,
  likePostController,
  findProfilePostsController,
} from "@/controllers/post/post.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { createPostSchema } from "@/schemas/post/create-post.schema.js";
import { postActionSchema } from "@/schemas/post/post-action.schema.js";
import { postCommentSchema } from "@/schemas/post/post-comment.schema.js";
import { Router } from "express";

const router = Router();

router.post("/create", validateData(createPostSchema), createPostController);

router.get("/feed", getFeedController);

router.post("/like", validateData(postActionSchema), likePostController);

router.post("/delete", validateData(postActionSchema), deletePostController);

router.post("/comment", validateData(postCommentSchema), commentPostController);

router.get("/profile/:profileId", findProfilePostsController);

router.get("/:postId", findPostController);

export default router;
