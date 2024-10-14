import { z } from "zod";

const envConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8080),
  MONGO_URI: z.string(),
  OAUTH_GOOGLE_CLIENT_ID: z.string(),
  OAUTH_GOOGLE_CLIENT_SECRET: z.string(),
  APP_URL: z.string(),
});

const envConfig = envConfigSchema.parse(process.env);

export default envConfig;
