import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionState } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import DeactivateAccountDialog from "./deactivate-account-dialog";
import ReactiveAccountDialog from "./reactivate-account-dialog";
import UpdatePasswordDialog from "./update-password-dialog";
import UpdateUsernameDialog from "./update-username-dialog";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, headers } = await redirectIfUnauthenticated(request);

  const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/has-password`);

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const data = await response.json();
  const updatePasswordAvailable = data.data;

  return json({ user, updatePasswordAvailable }, { headers });
}

export default function Index() {
  const { user, updatePasswordAvailable } = useLoaderData<typeof loader>();

  if (user.deactivated) {
    return (
      <div className="flex flex-col">
        <ReactiveAccountDialog
          toBeDeletedAt={user.toBeDeletedAt ? new Date(user.toBeDeletedAt) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <UpdateUsernameDialog username={user.username} />
      {updatePasswordAvailable && <UpdatePasswordDialog />}
      {!user.deactivated && <DeactivateAccountDialog />}
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { user, headers } = await redirectIfUnauthenticated(request);

  const formData = await request.formData();
  const _action = formData.get("_action") as ActionType;

  let actionState: ActionState<ActionType> = { _action, message: null, data: null };
  switch (_action) {
    case "update-username": {
      if (user.username === formData.get("username")) {
        return json(actionState, { headers });
      }
      const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/update-username`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        actionState.message = data.message || response.statusText;
        return json(actionState, { headers });
      }

      return json(actionState, { headers });
    }
    case "update-password": {
      const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/update-password`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        actionState.message = data.message || response.statusText;
        return json(actionState, { headers });
      }

      return json(actionState, { headers });
    }

    case "deactivate-account": {
      const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/deactivate`, {
        method: "PUT",
      });

      if (!response.ok) {
        const data = await response.json();
        actionState.message = data.message || response.statusText;
        return json(actionState, { headers });
      }

      return json(actionState, { headers });
    }

    case "delete-account": {
      const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/delete`, {
        method: "PUT",
      });

      if (!response.ok) {
        const data = await response.json();
        actionState.message = data.message || response.statusText;
        return json(actionState, { headers });
      }

      return json(actionState, { headers });
    }

    case "reactivate-account": {
      const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/reactivate`, {
        method: "PUT",
      });

      if (!response.ok) {
        const data = await response.json();
        actionState.message = data.message || response.statusText;
        return json(actionState, { headers });
      }

      return json(actionState, { headers });
    }
  }

  return json(actionState, { headers });
}

type ActionType =
  | "update-username"
  | "update-password"
  | "deactivate-account"
  | "delete-account"
  | "reactivate-account"
  | null;
