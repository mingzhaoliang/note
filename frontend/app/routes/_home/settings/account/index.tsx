import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import UpdatePasswordDialog from "./update-password-dialog";

export async function loader({ request }: LoaderFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/update-password`);

  if (!response.ok) throw new Error("Oops! Something went wrong!");

  const updatePasswordAvailable: boolean = (await response.json()).available;

  return json({ user, updatePasswordAvailable }, { headers });
}

export default function Index() {
  const { updatePasswordAvailable } = useLoaderData<typeof loader>();
  return <div className="flex flex-col">{updatePasswordAvailable && <UpdatePasswordDialog />}</div>;
}

export async function action({ request }: ActionFunctionArgs) {
  const { authHeader, user } = await redirectIfUnauthenticated(request);
  const headers = new Headers();
  if (authHeader) headers.append("Set-Cookie", authHeader);

  const formData = await request.formData();
  const _action = formData.get("_action");

  switch (_action) {
    case "updatePassword": {
      const response = await fetch(`${envConfig.API_URL}/auth/${user.id}/update-password`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json();
        return json({ actionState: { _action, message: error } }, { status: 400, headers });
      }

      return json({ actionState: { _action, message: null } }, { headers });
    }
  }

  return json(null, { headers });
}
