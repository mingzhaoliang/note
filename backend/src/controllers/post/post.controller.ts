import { createPostDto } from "@/lib/utils/createDto.js";
import { CreatePostSchema } from "@/schemas/post/create-post.schema.js";
import { ImageSchema } from "@/schemas/shared/image.schema.js";
import { uploadImage } from "@/services/apis/cloudinary.service.js";
import {
  commentPost,
  createPost,
  deletePost,
  findPost,
  findProfilePosts,
  getFeed,
  likePost,
  unLikePost,
} from "@/services/neon/post.service.js";
import { findProfile, getLikedPost } from "@/services/neon/profile.service.js";
import { CloudinaryAsset } from "@/types/index.js";
import { Request, Response } from "express";
import fs from "fs";

const createPostController = async (req: Request, res: Response) => {
  try {
    const { profileId, text, tags } = req.body as CreatePostSchema;

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

    const post = await createPost({ profileId, text, images, tags });

    const postDto = createPostDto(post);

    res.status(200).json({ post: postDto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getFeedController = async (req: Request, res: Response) => {
  try {
    const { lastPostId } = req.query as { lastPostId: string | undefined };
    const posts = await getFeed({ lastCursor: lastPostId });

    const postsDto = posts.map((post) => createPostDto(post));

    res.status(200).json({ posts: postsDto });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

const deletePostController = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params as { postId: string };
    await deletePost({ postId });
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const likePostController = async (req: Request, res: Response) => {
  try {
    const { postId, profileId } = req.body;
    const isLiked = (await getLikedPost(profileId, postId)) !== null;

    let postLike;

    if (isLiked) {
      postLike = await unLikePost({ postId, profileId });
    } else {
      postLike = await likePost({ postId, profileId });
    }

    const post = (await findPost(postLike.postId))!;
    const postDto = createPostDto(post);

    res.status(200).json({ post: postDto });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Oops! Something went wrong." });
  }
};

const findPostController = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params as { postId: string };
    const post = await findPost(postId);
    const postDto = createPostDto(post);

    if (!postDto) {
      res.status(404).json("Post not found.");
      return;
    }

    res.status(200).json({ post: postDto });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Oops! Something went wrong." });
  }
};

const commentPostController = async (req: Request, res: Response) => {
  try {
    const { profileId, postId, parentId, text } = req.body;

    const postComment = await commentPost({ postId, parentId, profileId, text });

    const post = (await findPost(postComment.postId))!;
    const postDto = createPostDto(post);

    res.status(200).json({ post: postDto, postComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const findProfilePostsController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { lastPostId } = req.query as { lastPostId: string | undefined };

    const profile = await findProfile({ username });
    if (!profile) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }
    const posts = await findProfilePosts({ profileId: profile.id, lastCursor: lastPostId });

    const postsDto = posts.map((post) => ({
      ...post,
      images: post.images.map(({ publicId }) => publicId),
    }));
    res.status(200).json({ posts: postsDto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export {
  commentPostController,
  createPostController,
  deletePostController,
  findPostController,
  findProfilePostsController,
  getFeedController,
  likePostController,
};
