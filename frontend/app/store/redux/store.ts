import { configureStore } from "@reduxjs/toolkit";
import exploreReducer from "./features/explore-slice";
import feedReducer from "./features/feed-slice";
import profileReducer from "./features/profile-slice";
import relationshipReducer from "./features/relationship-slice";

const store = configureStore({
  reducer: {
    feed: feedReducer,
    explore: exploreReducer,
    profile: profileReducer,
    relationship: relationshipReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
type AppStore = typeof store;

export { store, type AppDispatch, type AppStore, type RootState };
