import { createPost } from "@/services/neon/post.service.js";
import { findProfile } from "@/services/neon/profile.service.js";
import { Request, Response } from "express";

const createPostController = async (req: Request, res: Response) => {
  try {
    const { userId, text, images, tags } = req.body;

    const profile = await findProfile(userId);
    if (!profile) {
      res.status(400).json({ error: "Profile not found." });
      return;
    }

    await createPost({ profileId: profile.id, text, images, tags });

    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export { createPostController };
