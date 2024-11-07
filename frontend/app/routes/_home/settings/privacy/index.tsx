import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionState } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import PrivateProfile from "./private-profile";

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
  const _action = formData.get("_action") as ActionType;

  let actionState: ActionState<ActionType> = { _action, message: null, data: null };

  switch (_action) {
    case "private-profile": {
      const response = await fetch(`${envConfig.API_URL}/profile/${user.id}/privacy`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        actionState.message =
          response.status === 400 ? (await response.json()).message : response.statusText;
        return json(actionState, { status: 400, headers });
      }

      return json(actionState, { headers });
    }
  }

  return json(actionState, { headers });
}

type ActionType = "private-profile" | null;
