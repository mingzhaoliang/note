import { z } from "zod";
import { username } from "./update-username.schema.js";

const signupSchema = z.object({
  fullName: z.string().trim().min(1, { message: "Enter your full name." }),
  username,
  email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email." })
    .min(1, { message: "Enter your email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type SignupSchema = z.infer<typeof signupSchema>;

export { signupSchema, type SignupSchema };
