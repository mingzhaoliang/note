import { z } from "zod";

const envConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  API_URL: z.string(),
});

const envConfig = envConfigSchema.parse(process.env);

export default envConfig;
