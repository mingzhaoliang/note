import { z } from "zod";

export const createPostSchema = z.object({
  profileId: z.string({ required_error: "Profile ID is required." }),
  text: z
    .string()
    .min(1, { message: "Enter your note." })
    .max(500, { message: "Note is too long." }),
  tags: z
    .string()
    .transform((str) => {
      return str ? (JSON.parse(str.toLowerCase()) as string[]) : [];
    })
    .refine((tags) => tags.length <= 3, {
      message: "Tag limit reached.",
    }),
});

export const createCommentSchema = z.object({
  profileId: z.string({ required_error: "Profile ID is required." }),
  parentId: z.string({ required_error: "Parent ID is required." }),
  text: z
    .string({ required_error: "Enter your comment." })
    .min(1, { message: "Enter your comment." })
    .max(500, { message: "Comment is too long." }),
});
