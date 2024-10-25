import { z } from "zod";

const actionSchema = z.object({
  profileId: z.string({ required_error: "Profile ID is required." }),
});

type ActionSchema = z.infer<typeof actionSchema>;

export { actionSchema, type ActionSchema };
