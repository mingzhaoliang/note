import { z } from "zod";

const profileEditSchema = z.object({
  name: z.string().trim().min(1, { message: "Enter your full name." }),
  bio: z.string().trim().max(140, { message: "Bio is too long." }).optional(),
});

type ProfileEditSchema = z.infer<typeof profileEditSchema>;

export { profileEditSchema, type ProfileEditSchema };
