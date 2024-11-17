import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { createPost } from "@/store/redux/features/feed-slice";
import { store } from "@/store/redux/store";
import { ActionState } from "@/types";
import { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { user, headers } = await redirectIfUnauthenticated(request);

  const formData = await request.formData();
  const _action = formData.get("_action") as ActionType;

  const actionState: ActionState<ActionType> = { _action, message: null, data: null };

  switch (_action) {
    case "create": {
      formData.set("profileId", user.id);

      const tags = Array.from(formData.entries())
        .filter(([key]) => key.startsWith("tags"))
        .map(([, value]) => value as string);
      formData.set("tags", JSON.stringify(tags));

      const res = await fetch(`${envConfig.API_URL}/post`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        actionState.message = data.message ?? res.statusText;
        return json(actionState, { headers });
      }

      actionState.data = data.data;

      store.dispatch(createPost(actionState.data));

      return json(actionState, { headers });
    }
  }
}

type ActionType = "create";
