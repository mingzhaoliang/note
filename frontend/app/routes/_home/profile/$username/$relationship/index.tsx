import envConfig from "@/config/env.config.server";
import { requireUser } from "@/session/guard.server";
import { Relationship } from "@/types";
import { json, LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username, relationship } = params;
  if (relationship !== "followers" && relationship !== "following") {
    throw new Error("Invalid relationship");
  }
  const { user, headers } = await requireUser(request);

  const searchParams = new URL(request.url).searchParams;

  const response = await fetch(
    `${envConfig.API_URL}/profile/${username}/${relationship}?` + searchParams.toString()
  );

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const data = await response.json();
  const relationships: Relationship[] = data.data;
  const count: number = data.count;

  return json({ relationships, count, user }, { headers });
}
