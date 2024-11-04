import { z } from "zod";

const profilePrivacySchema = z.object({
  isPrivate: z
    .string()
    .refine((value) => value === "true" || value === "false", {
      message: "Value must be 'true' or 'false'.",
    })
    .transform((value) => value === "true"),
});

type ProfilePrivacySchema = z.infer<typeof profilePrivacySchema>;

export { profilePrivacySchema, type ProfilePrivacySchema };
