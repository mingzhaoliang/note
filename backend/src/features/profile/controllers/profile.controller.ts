import * as postService from "@/features/post/services/post.service.js";
import { ErrorResponse } from "@/middleware/errorHandler.js";
import asyncHandler from "express-async-handler";
import fileUpload from "express-fileupload";
import * as profileService from "../services/profile.service.js";

export const getProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const result = await profileService.getProfileByUsername(username);

  if (!result.success) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body;

  const result = await profileService.updateProfile({
    id,
    name,
    bio,
    avatarPath: (req.files?.avatar as fileUpload.UploadedFile | undefined)?.tempFilePath,
  });

  res.status(200).json({ success: true, data: result.data });
});

export const removeAvatar = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const result = await profileService.removeAvatar(id);

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});

export const searchProfiles = asyncHandler(async (req, res) => {
  const { q, last } = req.query as { q: string; last: string };
  const { data, count } = await profileService.getProfiles({ search: q, last });
  res.status(200).json({ success: true, data, count });
});

export const getPosts = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const { last } = req.query as { last: string | undefined };
  const result = await postService.getPostsByProfile({ username, last });
  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }
  res.status(200).json({ success: true, data: result.data, count: result.count });
});

export const getComments = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const { last } = req.query as { last: string | undefined };
  const result = await postService.getCommentsByProfile({
    username,
    last,
  });

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data, count: result.count });
});

export const getFollowers = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const { last, status } = req.query as { last: string | undefined; status: string | undefined };
  if (status !== "PENDING" && status !== "CONFIRMED") {
    return next(new ErrorResponse("Invalid status", 400));
  }

  const result = await profileService.getFollowers({ username, last, status });

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }
  res.status(200).json({ success: true, data: result.data, count: result.count });
});

export const getFollowing = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const { last } = req.query as { last: string | undefined };
  const result = await profileService.getFollowing({ username, last });

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }
  res.status(200).json({ success: true, data: result.data, count: result.count });
});

export const followProfile = asyncHandler(async (req, res, next) => {
  const { id: fromId } = req.params;
  const { profileId: toId } = req.body;

  const result = await profileService.followProfile({ fromId, toId });

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});

export const unfollowProfile = asyncHandler(async (req, res, next) => {
  const { id: fromId } = req.params;
  const { profileId: toId } = req.body;

  const result = await profileService.unfollowProfile({ fromId, toId });

  if (result.success === false) {
    return next(new ErrorResponse(result.message, result.statusCode));
  }

  res.status(200).json({ success: true, data: result.data });
});

export const confirmFollowRequest = asyncHandler(async (req, res, next) => {
  const { id: toId } = req.params;
  const { profileId: fromId } = req.body;

  const result = await profileService.confirmFollowRequest({ fromId, toId });

  res.status(200).json({ success: true, data: result.data });
});

export const declineFollowRequest = asyncHandler(async (req, res, next) => {
  const { id: toId } = req.params;
  const { profileId: fromId } = req.body;

  const result = await profileService.declineFollowRequest({ fromId, toId });

  res.status(200).json({ success: true, data: result.data });
});

export const updatePrivacy = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPrivate } = req.body;
    const result = await profileService.updatePrivacy({ id, isPrivate });

    if (result.success === false) {
      return next(new ErrorResponse(result.message, result.statusCode));
    }
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});
