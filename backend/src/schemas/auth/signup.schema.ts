import { z } from "zod";

const signupSchema = z.object({
  fullName: z.string().trim().min(1, { message: "Enter your full name." }),
  username: z.string().trim().min(1, { message: "Enter your username." }),
  email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email." })
    .min(1, { message: "Enter your email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type SignupSchema = z.infer<typeof signupSchema>;

export { signupSchema, type SignupSchema };
