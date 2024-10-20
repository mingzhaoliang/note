import { MAX_NOTE_LENGTH } from "@/config/post.config";
import { z } from "zod";

const postFormSchema = z.object({
  text: z
    .string()
    .min(1, { message: "Enter your note." })
    .max(MAX_NOTE_LENGTH, { message: "Note is too long." }),
  images: z.array(z.instanceof(File)).max(9, { message: "Too many images." }),
  tags: z.array(z.string()).max(3, { message: "Tag limit reached." }),
});

type PostFormSchema = z.infer<typeof postFormSchema>;

export { postFormSchema, type PostFormSchema };
