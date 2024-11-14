import { z } from "zod";

export const imageSchema = z.object({
  publicId: z.string(),
  type: z.string(),
  resourceType: z.string(),
  version: z.number(),
});
