import { z } from "zod";

export const createConversationSchema = z.object({
  senderId: z.string({ required_error: "Profile ID is required." }),
  recipientId: z.string({ required_error: "Profile ID is required." }),
});

export const sendMessageSchema = z.object({
  senderId: z.string({ required_error: "Profile ID is required." }),
  text: z
    .string({ required_error: "Enter your message." })
    .min(1, { message: "Enter your message." })
    .max(500, { message: "Message is too long." }),
});
