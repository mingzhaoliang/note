import { z } from "zod";

export const profileEditSchema = z.object({
  name: z.string().trim().min(1, { message: "Enter your full name." }),
  bio: z.string().trim().max(140, { message: "Bio is too long." }).default(""),
});

export const profilePrivacySchema = z.object({
  isPrivate: z
    .string()
    .refine((value) => value === "true" || value === "false", {
      message: "Value must be 'true' or 'false'.",
    })
    .transform((value) => value === "true"),
});
