import { DefaultEventsMap } from "@socket.io/component-emitter";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { usePublicEnv } from "./public-env.context";

const socketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>(
  undefined
);

const useSocket = () => {
  const context = useContext(socketContext);
  return context;
};

const SocketProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string | undefined;
}) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const { APP_URL } = usePublicEnv();

  useEffect(() => {
    if (!userId) return;
    const connection = io(APP_URL, { query: { userId } });
    setSocket(connection);

    return () => {
      connection.disconnect();
    };
  }, [userId, APP_URL]);

  return <socketContext.Provider value={socket}>{children}</socketContext.Provider>;
};

export { SocketProvider, useSocket };
