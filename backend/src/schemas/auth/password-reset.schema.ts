import { z } from "zod";

const resetPasswordRequestSchema = z.object({
  identifier: z.string(),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    passwordConfirmation: z.string({ required_error: "Confirm your password." }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export { resetPasswordRequestSchema, resetPasswordSchema };
