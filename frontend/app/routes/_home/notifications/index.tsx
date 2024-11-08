import { Card, CardContent, CardHeader } from "@/components/ui/card";
import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { Notification } from "@/types";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import NotificationItem from "./notification-item";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, headers } = await redirectIfUnauthenticated(request);

  const res = await fetch(`${envConfig.API_URL}/notification/${user.id}`);
  if (!res.ok) throw new Error("Oops! Something went wrong!");
  const data = await res.json();
  const notifications: Notification[] = data.notifications;

  return json({ notifications, user }, { headers });
}

export default function Index() {
  const { notifications } = useLoaderData<typeof loader>();

  return (
    <div className="w-full max-w-screen-sm h-screen flex flex-col mx-auto py-6 md:p-6">
      <h1 className="text-center text-xl font-semibold max-md:px-6 md:mb-6">Notifications</h1>
      <Card className="flex-1 w-full rounded-xl max-md:border-0 md:bg-primary-foreground">
        <CardHeader />
        <CardContent className="flex flex-col gap-y-2">
          {notifications.map(({ id, ...props }) => (
            <NotificationItem key={id} {...props} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
