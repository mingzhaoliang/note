import { z } from "zod";

const createConversationSchema = z.object({
  senderId: z.string({ required_error: "Profile ID is required." }),
  recipientId: z.string({ required_error: "Profile ID is required." }),
});

type CreateConversationSchema = z.infer<typeof createConversationSchema>;

export { createConversationSchema, type CreateConversationSchema };
