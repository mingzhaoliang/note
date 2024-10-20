import { z } from "zod";

const createPostSchema = z.object({
  profileId: z.string({ required_error: "Profile ID is required." }),
  text: z
    .string()
    .min(1, { message: "Enter your note." })
    .max(500, { message: "Note is too long." }),
  tags: z
    .string()
    .transform((str) => {
      return str ? JSON.parse(str.toLowerCase()) : [];
    })
    .refine((tags) => tags.length <= 3, {
      message: "Tag limit reached.",
    }),
  createdAt: z.coerce.date(),
});

type CreatePostSchema = z.infer<typeof createPostSchema>;

export { createPostSchema, type CreatePostSchema };
