import { createPost } from "@/services/neon/post.service.js";
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

export { createPostController };
