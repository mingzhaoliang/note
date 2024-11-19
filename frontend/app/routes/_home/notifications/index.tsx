import LoadMoreTrigger from "@/components/shared/load-more-trigger";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import envConfig from "@/config/env.config.server";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { useSocket } from "@/store/context/socket.context";
import {
  addNotifications,
  markAsSeen,
  setNotifications,
} from "@/store/redux/features/notifications-slice";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/redux/hooks";
import { Notification } from "@/types";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { useCallback, useEffect, useRef } from "react";
import NotificationItem from "./notification-item";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, headers } = await redirectIfUnauthenticated(request);
  const searchParams = new URL(request.url).searchParams;
  const last = searchParams.get("last");

  const res = await fetch(
    `${envConfig.API_URL}/notification/${user.id}?${last ? `last=${last}` : ""}`
  );
  if (!res.ok) throw new Error("Oops! Something went wrong!");
  const data = await res.json();
  const notifications: Notification[] = data.data;
  const count: number = data.count;

  return json({ notifications, count, user }, { headers });
}

export default function Index() {
  const { notifications: loadedNotifications, count, user } = useLoaderData<typeof loader>();
  const socket = useSocket();
  const store = useAppStore();
  const initialised = useRef(false);
  if (!initialised.current) {
    initialised.current = true;
    store.dispatch(setNotifications(loadedNotifications));
  }

  const notifications = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();
  const last = notifications[notifications.length - 1]?.id;
  const containerRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(({ notifications }: { notifications: Notification[] }) => {
    dispatch(addNotifications(notifications));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            socket.emit("notification:mark-as-seen", { userId: user.id });
            dispatch(markAsSeen());
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: "0px",
        threshold: 0,
      }
    );

    const element = firstItemRef.current;
    if (!element) return;

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [socket, dispatch, user.id]);

  return (
    <div className="w-full max-w-screen-sm h-screen flex flex-col mx-auto py-6 md:p-6">
      <h1 className="text-center text-xl font-semibold max-md:px-6 md:mb-6">Notifications</h1>
      <Card className="flex-1 w-full rounded-xl max-md:border-0 md:bg-primary-foreground">
        <CardHeader />
        <CardContent ref={containerRef} className="flex flex-col gap-y-4">
          {notifications.length === 0 && (
            <p className="text-center text-muted-foreground">No notifications yet</p>
          )}
          {notifications.map(({ id, ...props }, index) => (
            <NotificationItem key={id} ref={index === 0 ? firstItemRef : undefined} {...props} />
          ))}
          {last && (
            <LoadMoreTrigger
              hasMore={notifications.length < count}
              onLoad={handleLoadMore}
              nextPageUrl={`/notifications?last=${last}`}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
