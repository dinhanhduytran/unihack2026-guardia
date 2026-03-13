// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import safeRouteReducer from "./safeRouteSlice";
import userProfileReducer from "./userProfileSlice";

export const store = configureStore({
  reducer: {
    safeRoute: safeRouteReducer,
    userProfile: userProfileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
