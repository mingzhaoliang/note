import envConfig from "@/config/env.config.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;

  const type = searchParams.get("type");
  const identifier = searchParams.get("identifier");

  if (!type || !identifier) {
    return json({ isValid: false });
  }

  const response = await fetch(
    `${envConfig.API_URL}/auth/check-identifier?identifier=${identifier}&type=${type}`
  );
  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const { isValid } = (await response.json()) as { isValid: boolean };

  return json({ isValid });
}
