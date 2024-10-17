import { z } from "zod";
import { imageSchema } from "../shared/image.schema.js";

const createPostSchema = z.object({
  userId: z.string({ required_error: "User ID is required." }),
  text: z
    .string()
    .min(1, { message: "Enter your note." })
    .max(500, { message: "Note is too long." }),
  images: z.array(imageSchema).max(9, { message: "Too many images." }).default([]),
  tags: z
    .array(z.string().transform((str) => str.toLowerCase()))
    .max(3, { message: "Tag limit reached." })
    .default([]),
});

type CreatePostSchema = z.infer<typeof createPostSchema>;

export { createPostSchema, type CreatePostSchema };
