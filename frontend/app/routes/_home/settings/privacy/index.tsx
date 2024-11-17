import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionState } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import PrivateProfile from "./private-profile";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, headers } = await redirectIfUnauthenticated(request);

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
  const { user, headers } = await redirectIfUnauthenticated(request);

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
        const data = await response.json();
        actionState.message = data.message ?? response.statusText;
        return json(actionState, { status: 400, headers });
      }

      return json(actionState, { headers });
    }
  }

  return json(actionState, { headers });
}

type ActionType = "private-profile" | null;
