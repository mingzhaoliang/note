import { ImageSchema } from "@/schemas/shared/image.schema.js";
import { uploadImage } from "@/services/apis/cloudinary.service.js";
import {
  createPost,
  deletePost,
  findPost,
  getFeed,
  likePost,
  unLikePost,
} from "@/services/neon/post.service.js";
import { getLikedPost } from "@/services/neon/profile.service.js";
import { CloudinaryAsset } from "@/types/index.js";
import { Request, Response } from "express";
import fs from "fs";

const createPostController = async (req: Request, res: Response) => {
  try {
    const { profileId, text, tags } = req.body;

    const imagePaths = Object.values((req.files ?? {}) as any).map((file: any) => {
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.mimetype)) {
        throw new Error("Invalid file type.");
      }
      return file.tempFilePath;
    });

    let images: ImageSchema[] = [];
    for (const imagePath of imagePaths) {
      const {
        public_id: publicId,
        resource_type: resourceType,
        type,
        version,
      } = (await uploadImage(imagePath, {
        folder: "/note/post",
      })) as CloudinaryAsset;

      images.push({ publicId, resourceType, type, version });

      fs.unlinkSync(imagePath);
    }

    await createPost({ profileId, text, images, tags });

    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

const getFeedController = async (req: Request, res: Response) => {
  try {
    const { lastPostId } = req.query as { lastPostId: string | undefined };
    const posts = await getFeed({ lastCursor: lastPostId });

    res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

const deletePostController = async (req: Request, res: Response) => {
  try {
    const { postId, profileId } = req.body;
    await deletePost({ postId, profileId });
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

const likePostController = async (req: Request, res: Response) => {
  try {
    const { postId, profileId } = req.body;
    const isLiked = (await getLikedPost(profileId, postId)) !== null;

    if (isLiked) {
      await unLikePost({ postId, profileId });
    } else {
      await likePost({ postId, profileId });
    }

    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

const findPostController = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params as { postId: string };
    const post = await findPost(postId);

    res.status(200).json({ post });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

export {
  createPostController,
  deletePostController,
  getFeedController,
  findPostController,
  likePostController,
};
