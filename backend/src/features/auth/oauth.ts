import envConfig from "@/config/env.config.js";
import { Google } from "arctic";

export const google = new Google(
  envConfig.OAUTH_GOOGLE_CLIENT_ID,
  envConfig.OAUTH_GOOGLE_CLIENT_SECRET,
  envConfig.APP_URL + "/login/google/callback"
);
