import {
  createCommentController,
  createPostController,
  deletePostController,
  findPostController,
  getCommentsController,
  getFeedPostsController,
  likeUnlikePostController,
} from "@/controllers/post/post.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { createCommentSchema } from "@/schemas/post/create-comment.schema.js";
import { createPostSchema } from "@/schemas/post/create-post.schema.js";
import { actionSchema } from "@/schemas/shared/action.schema.js";
import { Router } from "express";

const router = Router();

router.post("/", validateData(createPostSchema), createPostController);

router.post("/comment", validateData(createCommentSchema), createCommentController);

router.get("/feed", getFeedPostsController);

router.put("/:id/like", validateData(actionSchema), likeUnlikePostController);

router.get("/:postId", findPostController);

router.get("/:id/comments", getCommentsController);

router.post("/:postId/delete", deletePostController);

export default router;
