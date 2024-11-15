import * as postController from "@/features/post/controllers/post.controller.js";
import {
  createCommentSchema,
  createPostSchema,
} from "@/features/post/validation/post.validation.js";
import { actionSchema } from "@/features/shared/validation/action.validation.js";
import { validateData } from "@/middleware/validation.js";
import { Router } from "express";

const router = Router();

router.get("/", postController.getPosts);
router.get("/search", postController.searchPosts);
router.get("/:id", postController.getPost);
router.get("/:id/comments", postController.getPostComments);
router.put("/:id/like-unlike", validateData(actionSchema), postController.likeUnlikePost);
router.post("/:id/delete", validateData(actionSchema), postController.deletePost);
router.post("/", validateData(createPostSchema), postController.createPost);
router.post("/comment", validateData(createCommentSchema), postController.createComment);

export default router;
