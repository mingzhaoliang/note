import { Post } from "@/types";
import { createContext, useContext } from "react";
import { Updater, useImmer } from "use-immer";

type FeedContext = {
  posts: Post[];
  setPosts: Updater<Post[]>;
};

const feedContext = createContext<FeedContext>({
  posts: [],
  setPosts: () => {},
});

const useFeed = () => {
  const context = useContext(feedContext);
  if (!context) {
    throw new Error("useFeed must be used within a FeedContextProvider");
  }
  return context;
};

const FeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useImmer<Post[]>([]);

  return (
    <feedContext.Provider
      value={{
        posts,
        setPosts,
      }}
    >
      {children}
    </feedContext.Provider>
  );
};

export { FeedProvider, useFeed };
