import { unLikePost, createPost, getFeed, likePost } from "@/services/neon/post.service.js";
import { getLikedPost } from "@/services/neon/profile.service.js";
import { Request, Response } from "express";

const createPostController = async (req: Request, res: Response) => {
  try {
    const { userId, text, images, tags } = req.body;

    await createPost({ profileId: userId, text, images, tags });

    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getFeedController = async (req: Request, res: Response) => {
  try {
    const { lastPostId } = req.query as { lastPostId: string | undefined };
    const posts = await getFeed({ lastCursor: lastPostId });

    res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
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
    res.status(500).json({ error: "Internal server error." });
  }
};

export { createPostController, getFeedController, likePostController };
