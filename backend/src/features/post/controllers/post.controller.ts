import { ErrorResponse } from "@/middleware/errorHandler.js";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as postService from "../services/post.service.js";

export const getPost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const result = await postService.getPost(id);

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});

export const likeUnlikePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { profileId } = req.body;
  const result = await postService.likeUnlikePost({ postId: id, profileId });

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});

export const createPost = asyncHandler(async (req, res, next) => {
  const { profileId, text, tags } = req.body;

  const imagePaths = Object.values((req.files ?? {}) as any).map((file: any) => {
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.mimetype)) {
      return next(new ErrorResponse("Invalid image type", 400));
    }
    return file.tempFilePath;
  });

  const result = await postService.createPost({ profileId, text, imagePaths, tags });

  res.status(200).json({ success: true, data: result.data });
});

export const createComment = asyncHandler(async (req, res) => {
  const data = await postService.createComment(req.body);
  res.status(200).json({ success: true, data });
});

export const getPosts = asyncHandler(async (req, res) => {
  try {
    const { last, profileId } = req.query as {
      last: string | undefined;
      profileId: string | undefined;
    };
    const { data, count } = await postService.getPosts({ last, profileId });

    res.status(200).json({ success: true, data, count });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

export const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { profileId } = req.body;
  const result = await postService.deletePost({ postId: id, profileId });

  res.status(200).json({ success: true, data: result.data });
});

export const getPostComments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { last } = req.query as { last: string | undefined };
  const { data, count } = await postService.getPostComments({ parentId: id, last });

  res.status(200).json({ success: true, data, count });
});

export const searchPosts = asyncHandler(async (req: Request, res: Response) => {
  const { q, last, profileId } = req.query as {
    q: string;
    last: string | undefined;
    profileId: string | undefined;
  };

  const { data, count } = await postService.getPosts({ search: q, last, profileId });

  res.status(200).json({ success: true, data, count });
});
