import { Notification } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Notification[] = [];

const notificationsSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      return action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      if (!state.find((notification) => notification.id === action.payload.id)) {
        state.unshift(action.payload);
      }
    },
    addNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.unshift(...action.payload);
    },
    markAsSeen: (state) => {
      state.forEach((notification) => {
        notification.seen = true;
      });
    },
  },
});

export const { setNotifications, addNotification, addNotifications, markAsSeen } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
