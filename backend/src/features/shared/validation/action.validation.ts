import { z } from "zod";

export const actionSchema = z.object({
  profileId: z.string({ required_error: "Profile ID is required." }),
});
