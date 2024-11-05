import { configureStore } from "@reduxjs/toolkit";
import postReducer from "./features/post-slice";
import relationshipReducer from "./features/relationship-slice";

const store = configureStore({
  reducer: {
    post: postReducer,
    relationship: relationshipReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
type AppStore = typeof store;

export { store, type AppDispatch, type AppStore, type RootState };
