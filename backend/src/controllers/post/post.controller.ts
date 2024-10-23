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
import { getLikedPost } from "@/services/neon/profile.service.js";
import { CloudinaryAsset } from "@/types/index.js";
import { Request, Response } from "express";
import fs from "fs";

const createPostController = async (req: Request, res: Response) => {
  try {
    const { profileId, text, tags, createdAt } = req.body as CreatePostSchema;

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

    const { id } = await createPost({ profileId, text, images, tags, createdAt });

    res.status(200).json({ postId: id });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

const getFeedController = async (req: Request, res: Response) => {
  try {
    const { lastPostId } = req.query as { lastPostId: string | undefined };
    const posts = await getFeed({ lastCursor: lastPostId });

    const postsDto = posts.map((post) => ({
      ...post,
      profile: {
        ...post.profile,
        avatar: post.profile.avatar ? post.profile.avatar : null,
      },
      tags: post.tags.map(({ tag: { name } }) => name),
      images: post.images.map(({ publicId }) => publicId),
      likes: post.likes.map(({ profileId }) => profileId),
      commentCount: post._count.comments,
    }));

    res.status(200).json({ posts: postsDto });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

const deletePostController = async (req: Request, res: Response) => {
  try {
    const { postId, profileId } = req.body;
    const { id } = await deletePost({ postId, profileId });
    res.status(200).json({ postId: id });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
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

    res.status(200).json({ postId: postLike.postId });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

const findPostController = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params as { postId: string };
    const post = await findPost(postId);

    if (!post) {
      res.status(404).json("Post not found.");
      return;
    }

    const postDto = {
      ...post,
      profile: {
        ...post.profile,
        avatar: post.profile.avatar ? post.profile.avatar : null,
      },
      tags: post.tags.map(({ tag: { name } }) => name),
      images: post.images.map(({ publicId }) => publicId),
      likes: post.likes.map(({ profileId }: any) => profileId),
      commentCount: post._count.comments,
    };

    res.status(200).json({ post: postDto });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

const commentPostController = async (req: Request, res: Response) => {
  try {
    const { profileId, postId, parentId, text, createdAt } = req.body;

    const postComment = await commentPost({ postId, parentId, profileId, text, createdAt });
    res.status(200).json({ postId: postComment.postId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const findProfilePostsController = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const { lastPostId } = req.query as { lastPostId: string | undefined };

    const posts = await findProfilePosts({ profileId, lastCursor: lastPostId });

    const postsDto = posts.map((post) => ({
      ...post,
      images: post.images.map(({ publicId }) => publicId),
    }));
    res.status(200).json({ posts: postsDto });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
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
