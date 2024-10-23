import { configureStore } from "@reduxjs/toolkit";
import postReducer from "./features/post-slice";

const store = configureStore({
  reducer: {
    post: postReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
type AppStore = typeof store;

export { store, type RootState, type AppDispatch, type AppStore };
