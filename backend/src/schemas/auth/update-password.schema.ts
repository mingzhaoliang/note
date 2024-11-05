import { z } from "zod";

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, { message: "Enter your current password." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    passwordConfirmation: z.string({ required_error: "Confirm your password." }),
  })
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

export { updatePasswordSchema, type UpdatePasswordSchema };
