import {
  commentPostController,
  createPostController,
  deletePostController,
  findPostCommentsController,
  findPostController,
  likePostController,
  getFeedPostsController,
} from "@/controllers/post/post.controller.js";
import { validateData } from "@/middleware/validation.middleware.js";
import { actionSchema } from "@/schemas/post/action.schema.js";
import { createPostSchema } from "@/schemas/post/create-post.schema.js";
import { postCommentSchema } from "@/schemas/post/post-comment.schema.js";
import { Router } from "express";

const router = Router();

router.post("/", validateData(createPostSchema), createPostController);


router.put("/:postId/like", validateData(actionSchema), likePostController);
router.get("/feed", getFeedPostsController);

router.delete("/delete/:postId", deletePostController);

router.post("/comment", validateData(postCommentSchema), commentPostController);

router.get("/:postId", findPostController);

router.get("/comment/:postId", findPostCommentsController);

export default router;
