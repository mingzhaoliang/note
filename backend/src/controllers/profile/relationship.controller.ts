import { ActionSchema } from "@/schemas/shared/action.schema.js";
import { deleteNotifications, sendNotification } from "@/services/neon/notification.service.js";
import {
  followProfile,
  getFollowers,
  getFollowing,
  getProfile,
  unfollowProfile,
} from "@/services/neon/profile.service.js";
import { Request, Response } from "express";

export async function followProfileController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { profileId } = req.body as ActionSchema;

    const profileToFollow = await getProfile({ id: profileId });
    if (!profileToFollow) {
      res.status(404).end();
      return;
    }

    const isFollowing = profileToFollow.follower.some(({ fromId }) => fromId === id);
    let relationship;
    if (isFollowing) {
      relationship = await unfollowProfile({ fromId: id, toId: profileToFollow.id });
      if (relationship.status === "PENDING") {
        deleteNotifications(3, id, profileToFollow.id);
      }
    } else if (profileToFollow.private) {
      relationship = await followProfile({ fromId: id, toId: profileToFollow.id });
      sendNotification(3, id, profileToFollow.id);
    } else {
      relationship = await followProfile({
        fromId: id,
        toId: profileToFollow.id,
        status: "CONFIRMED",
      });
    }

    res.status(200).json({ relationship });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

export async function confirmRequestController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { profileId } = req.body as ActionSchema;
    const relationship = await followProfile({ fromId: profileId, toId: id, status: "CONFIRMED" });
    await deleteNotifications(3, profileId, id);
    res.status(200).json({ relationship });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

export async function declineRequestController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { profileId } = req.body as ActionSchema;
    const relationship = await unfollowProfile({ fromId: profileId, toId: id });
    await deleteNotifications(3, profileId, id);
    res.status(200).json({ relationship });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

export async function getFollowersController(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const { last, status = "CONFIRMED" } = req.query as {
      last: string | undefined;
      status: "CONFIRMED" | "PENDING" | undefined;
    };
    const profile = await getProfile({ username });
    if (!profile) {
      res.status(404).end();
      return;
    }

    const { followers, remaining } = await getFollowers({
      id: profile.id,
      last,
      status,
    });
    res.status(200).json({ relationships: followers, remaining });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

export async function getFollowingController(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const { last } = req.query as { last: string | undefined };
    const profile = await getProfile({ username });
    if (!profile) {
      res.status(404).end();
      return;
    }

    const { following, remaining } = await getFollowing({
      id: profile.id,
      last,
      status: "CONFIRMED",
    });
    res.status(200).json({ relationships: following, remaining });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}
