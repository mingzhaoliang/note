import { z } from "zod";

const postActionSchema = z.object({
  postId: z.string({ required_error: "Post ID is required." }),
  profileId: z.string({ required_error: "Profile ID is required." }),
});

export { postActionSchema };
