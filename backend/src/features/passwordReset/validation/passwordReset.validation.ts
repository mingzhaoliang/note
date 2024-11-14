import { z } from "zod";

export const resetPasswordRequestSchema = z.object({
  identifier: z.string(),
});

export const verifyEmailSchema = z.object({
  code: z
    .string({ required_error: "Invalid or missing fields." })
    .min(1, { message: "Enter your code." }),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    passwordConfirmation: z.string({ required_error: "Confirm your password." }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });
