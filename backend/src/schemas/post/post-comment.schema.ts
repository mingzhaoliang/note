import { z } from "zod";

const postCommentSchema = z.object({
  profileId: z.string({ required_error: "Profile ID is required." }),
  postId: z.string({ required_error: "Post ID is required." }),
  parentId: z.string().optional(),
  text: z
    .string({ required_error: "Enter your comment." })
    .min(1, { message: "Enter your comment." })
    .max(500, { message: "Comment is too long." }),
  createdAt: z.coerce.date(),
});

export { postCommentSchema };
