import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string({ required_error: "Enter your email or username." }).trim(),
  password: z.string({ required_error: "Enter your password." }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export { loginSchema, type LoginSchema };
