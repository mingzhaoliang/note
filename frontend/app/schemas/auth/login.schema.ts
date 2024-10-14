import { z } from "zod";

const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Enter your email or username." })
    .trim()
    .min(1, { message: "Enter your email or username." }),
  password: z.string({ required_error: "Enter your password." }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export { loginSchema, type LoginSchema };
