import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import PrivateProfile from "./private-profile";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);
  return json({ user }, { headers });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col">
      <PrivateProfile isPrivate={user.private} />
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const formData = await request.formData();
  const _action = formData.get("_action");

  switch (_action) {
    case "private": {
      const response = await fetch(`${envConfig.API_URL}/profile/${user.id}/privacy`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json();
        return json(
          { actionState: { _action: "private", message: error } },
          { status: 400, headers }
        );
      }

      return json({ actionState: { _action: "private", message: null } }, { headers });
    }
  }

  return json(null, { headers });
}
