import { z } from "zod";

const envConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  API_URL: z.string(),
  DOMAIN: z.string(),
  COOKIE_SECRETS: z.string().transform((s) => s.split(",")),
});

const envConfig = envConfigSchema.parse(process.env);

export default envConfig;
