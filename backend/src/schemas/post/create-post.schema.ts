import { z } from "zod";

const createPostSchema = z.object({
  profileId: z.string({ required_error: "Profile ID is required." }),
  text: z
    .string()
    .min(1, { message: "Enter your note." })
    .max(500, { message: "Note is too long." }),
  tags: z
    .array(z.string().transform((str) => str.toLowerCase()))
    .max(3, { message: "Tag limit reached." })
    .default([]),
});

type CreatePostSchema = z.infer<typeof createPostSchema>;

export { createPostSchema, type CreatePostSchema };
