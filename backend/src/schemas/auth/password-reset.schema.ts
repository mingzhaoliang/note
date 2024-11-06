import { z } from "zod";

const resetPasswordRequestSchema = z.object({
  identifier: z.string(),
});

const verifyEmailSchema = z.object({
  code: z
    .string({ required_error: "Invalid or missing fields." })
    .min(1, { message: "Enter your code." }),
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

type ResetPasswordRequestSchema = z.infer<typeof resetPasswordRequestSchema>;
type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export {
  resetPasswordRequestSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type ResetPasswordRequestSchema,
  type ResetPasswordSchema,
  type VerifyEmailSchema,
};
