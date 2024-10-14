import { z } from "zod";

const envConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_URL: z.string(),
  API_URL: z.string(),
  DOMAIN: z.string(),
  COOKIE_SECRETS: z.string().transform((s) => s.split(",")),
  NM_GMAIL_FROM: z.string(),
  NM_GMAIL_APP_PASSWORD: z.string(),
});

const envConfig = envConfigSchema.parse(process.env);

export default envConfig;
