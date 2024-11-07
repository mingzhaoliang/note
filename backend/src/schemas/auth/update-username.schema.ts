import { prisma } from "@/lib/db/prisma.js";
import { z } from "zod";

const updateUsernameSchema = z.object({
  username: z
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
    ),
});

type UpdateUsernameSchema = z.infer<typeof updateUsernameSchema>;

export { updateUsernameSchema, type UpdateUsernameSchema };
