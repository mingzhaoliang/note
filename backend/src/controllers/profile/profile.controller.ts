import { findProfile, findProfileOverview } from "@/services/neon/profile.service.js";
import { Request, Response } from "express";

const findProfileOverviewController = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const profile = await findProfileOverview(profileId);

    if (!profile) {
      res.status(404).json("Profile not found.");
      return;
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error.");
  }
};

export { findProfileOverviewController };
