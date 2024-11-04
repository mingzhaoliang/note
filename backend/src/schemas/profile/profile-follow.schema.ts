import { z } from "zod";

const profileFollowSchema = z.object({
  username: z.string({ required_error: "Username is required." }),
});

type ProfileFollowSchema = z.infer<typeof profileFollowSchema>;

export { profileFollowSchema, type ProfileFollowSchema };
