import { createContext, useContext } from "react";

type PublicEnvContext = {
  CLOUDINARY_CLOUD_NAME: string;
};

const publicEnvContext = createContext<PublicEnvContext>({
  CLOUDINARY_CLOUD_NAME: "",
});

const usePublicEnv = () => {
  const ctx = useContext(publicEnvContext);
  if (!ctx) {
    throw new Error("usePublicEnv must be used within a PublicEnvProvider");
  }
  return ctx;
};

const PublicEnvProvider = ({ children, ...props }: React.PropsWithChildren<PublicEnvContext>) => {
  return <publicEnvContext.Provider value={props}>{children}</publicEnvContext.Provider>;
};

export { PublicEnvProvider, usePublicEnv };
