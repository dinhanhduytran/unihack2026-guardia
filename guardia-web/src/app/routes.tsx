import { Navigate, createBrowserRouter } from "react-router-dom";
import S0Welcome from "../screens/S0Welcome";
import S1Onboarding from "../screens/S1Onboarding";
import S2Permissions from "../screens/S2Permissions";
import S3Home from "../screens/S3Home";
import S4MapPreJourney from "../screens/S4MapPreJourney";
import S5JourneyActive from "../screens/S5JourneyActive";
import S6Companion from "../screens/S6Companion";
import S7AICall from "../screens/S7AICall";
import Profile from "../screens/Profile";
import { hasCompletedSetupFromStorage } from "../store/persistence";

export const appRouter = createBrowserRouter([
  { path: "/", element: hasCompletedSetupFromStorage() ? <Navigate to="/home" replace /> : <S0Welcome /> },
  { path: "/onboarding", element: <S1Onboarding /> },
  { path: "/permissions", element: <S2Permissions /> },
  { path: "/home", element: <S3Home /> },
  { path: "/map", element: <S4MapPreJourney /> },
  { path: "/journey", element: <S5JourneyActive /> },
  { path: "/companion", element: <S6Companion /> },
  { path: "/ai-call", element: <S7AICall /> },
  { path: "/profile", element: <Profile /> },
]);
