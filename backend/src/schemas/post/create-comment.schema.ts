import { z } from "zod";

const createCommentSchema = z.object({
  profileId: z.string({ required_error: "Profile ID is required." }),
  commentOnId: z.string().optional(),
  text: z
    .string({ required_error: "Enter your comment." })
    .min(1, { message: "Enter your comment." })
    .max(500, { message: "Comment is too long." }),
});

type CreateCommentSchema = z.infer<typeof createCommentSchema>;

export { createCommentSchema, type CreateCommentSchema };
