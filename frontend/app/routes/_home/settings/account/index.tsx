import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionState } from "@/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import DeactivateAccountDialog from "./deactivate-account-dialog";
import ReactiveAccountDialog from "./reactivate-account-dialog";
import UpdatePasswordDialog from "./update-password-dialog";

export async function loader({ request }: LoaderFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/update-password`);

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const { available: updatePasswordAvailable } = (await response.json()) as {
    available: boolean;
  };

  return json({ user, updatePasswordAvailable }, { headers });
}

export default function Index() {
  const { user, updatePasswordAvailable } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-y-4">
      {updatePasswordAvailable && <UpdatePasswordDialog />}
      {!user.deactivated && <DeactivateAccountDialog />}
      {user.deactivated && (
        <ReactiveAccountDialog
          toBeDeletedAt={user.toBeDeletedAt ? new Date(user.toBeDeletedAt) : undefined}
        />
      )}
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
    case "update-password": {
      const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/update-password`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        actionState.message =
          response.status === 400 ? (await response.json()).message : response.statusText;
        return json(actionState, { headers });
      }

      return json(actionState, { headers });
    }

    case "deactivate-account": {
      const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/deactivate`, {
        method: "PUT",
      });

      if (!response.ok) {
        actionState.message =
          response.status === 400 ? (await response.json()).message : response.statusText;
        return json(actionState, { headers });
      }

      return json(actionState, { headers });
    }

    case "delete-account": {
      const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/delete`, {
        method: "PUT",
      });

      if (!response.ok) {
        actionState.message =
          response.status === 400 ? (await response.json()).message : response.statusText;
        return json(actionState, { headers });
      }

      return json(actionState, { headers });
    }

    case "reactivate-account": {
      const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/reactivate`, {
        method: "PUT",
      });

      if (!response.ok) {
        actionState.message =
          response.status === 400 ? (await response.json()).message : response.statusText;
        return json(actionState, { headers });
      }

      return json(actionState, { headers });
    }
  }

  return json(actionState, { headers });
}

type ActionType =
  | "update-password"
  | "deactivate-account"
  | "delete-account"
  | "reactivate-account"
  | null;
