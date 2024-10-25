import { createCommentDto, createPostDto } from "@/lib/utils/createDto.js";
import { CreateCommentSchema } from "@/schemas/post/create-comment.schema.js";
import { CreatePostSchema } from "@/schemas/post/create-post.schema.js";
import { ActionSchema } from "@/schemas/shared/action.schema.js";
import { ImageSchema } from "@/schemas/shared/image.schema.js";
import { uploadImage } from "@/services/apis/cloudinary.service.js";
import {
  createComment,
  createPost,
  deletePost,
  findPost,
  findProfilePosts,
  getComments,
  getFeedPosts,
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

const getFeedPostsController = async (req: Request, res: Response) => {
  try {
    const { lastPostId } = req.query as { lastPostId: string | undefined };
    const posts = await getFeedPosts({ lastCursor: lastPostId });

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

const likeUnlikePostController = async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;
    const { profileId } = req.body as ActionSchema;
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

const getCommentsController = async (req: Request, res: Response) => {
  try {
    const { id: commentOnId } = req.params;
    const { lastCommentId } = req.query as { lastCommentId: string | undefined };
    const comments = await getComments({ commentOnId, lastCursor: lastCommentId });

    const commentsDto = comments.map((comment) => createCommentDto(comment));

    res.status(200).json({ comments: commentsDto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const createCommentController = async (req: Request, res: Response) => {
  try {
    const data = req.body as CreateCommentSchema;

    const comment = await createComment(data);

    const post = await findPost(comment.commentOnId!);
    const postDto = createPostDto(post);

    res.status(200).json({ post: postDto, comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export {
  createCommentController,
  createPostController,
  deletePostController,
  findPostController,
  findProfilePostsController,
  getCommentsController,
  getFeedPostsController,
  likeUnlikePostController,
};
