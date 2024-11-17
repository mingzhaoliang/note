import envConfig from "@/config/env.config.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return json({ isValid: false });
  }

  const response = await fetch(`${envConfig.API_URL}/auth/is-unique-username?username=${username}`);
  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const data = await response.json();
  const isValid: boolean = data.data;

  return json({ isValid });
}
