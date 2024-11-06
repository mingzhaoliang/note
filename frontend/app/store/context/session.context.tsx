import { User } from "@/types";
import { createContext, useContext } from "react";

type SessionContext = {
  user: User | null;
};

const sessionContext = createContext<SessionContext>({
  user: null,
});

const useSession = () => {
  const context = useContext(sessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

type SessionProviderProps = {
  user: User | null;
};

const SessionProvider = ({ children, user }: React.PropsWithChildren<SessionProviderProps>) => {
  return <sessionContext.Provider value={{ user }}>{children}</sessionContext.Provider>;
};

export { SessionProvider, useSession };
