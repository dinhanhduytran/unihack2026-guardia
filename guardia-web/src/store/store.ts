import { configureStore } from "@reduxjs/toolkit";
import locationReducer from "./locationSlice";
import profileReducer from "./profileSlice";

export const store = configureStore({
  reducer: {
    location: locationReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
