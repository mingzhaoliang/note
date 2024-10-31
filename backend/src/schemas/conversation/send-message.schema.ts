import { z } from "zod";

const sendMessageSchema = z.object({
  senderId: z.string({ required_error: "Profile ID is required." }),
  text: z
    .string({ required_error: "Enter your message." })
    .min(1, { message: "Enter your message." })
    .max(500, { message: "Message is too long." }),
});

type SendMessageSchema = z.infer<typeof sendMessageSchema>;

export { sendMessageSchema, type SendMessageSchema };
