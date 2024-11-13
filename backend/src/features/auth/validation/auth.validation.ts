import { prisma } from "@/prisma/client.js";
import { z } from "zod";

export const username = z
  .string({ required_error: "Enter your username." })
  .regex(/^[a-zA-Z0-9\._]+$/, { message: "Enter a valid username." })
  .min(1, { message: "Enter your username." })
  .refine(
    async (username) => {
      const user = await prisma.user.findUnique({ where: { username } });
      if (user) return false;
      return true;
    },
    { message: "Username is already taken." }
  );

export const loginSchema = z.object({
  identifier: z.string({ required_error: "Enter your email or username." }).trim(),
  password: z.string({ required_error: "Enter your password." }),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, { message: "Enter your full name." }),
  username,
  email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email." })
    .min(1, { message: "Enter your email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, { message: "Enter your current password." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    passwordConfirmation: z.string({ required_error: "Confirm your password." }),
  })
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export const updateUsernameSchema = z.object({ username });
