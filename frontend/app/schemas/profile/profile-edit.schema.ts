import { MAX_IMAGE_SIZE } from "@/config/shared.config";
import { z } from "zod";

const profileEditSchema = z.object({
  name: z.string().trim().min(1, { message: "Enter your full name." }),
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9\._]+$/, { message: "Enter a valid username." })
    .min(1, { message: "Enter your username." }),
  bio: z.string().trim().max(140, { message: "Bio is too long." }).optional(),
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_IMAGE_SIZE, { message: "Image too large." })
    .optional(),
});

type ProfileEditSchema = z.infer<typeof profileEditSchema>;

export { profileEditSchema, type ProfileEditSchema };
