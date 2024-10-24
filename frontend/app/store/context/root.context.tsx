import { createContext, useContext } from "react";

type RootContext = {
  CLOUDINARY_CLOUD_NAME: string;
};

const rootContext = createContext<RootContext>({
  CLOUDINARY_CLOUD_NAME: "",
});

const useRootContext = () => {
  const ctx = useContext(rootContext);
  if (!ctx) {
    throw new Error("useRoot must be used within a RootProvider");
  }
  return ctx;
};

const RootProvider = ({ children, ...props }: React.PropsWithChildren<RootContext>) => {
  return <rootContext.Provider value={props}>{children}</rootContext.Provider>;
};

export { RootProvider, useRootContext };
