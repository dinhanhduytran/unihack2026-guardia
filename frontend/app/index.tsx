import { Redirect } from "expo-router";

import { useAppSelector } from "@/store/hooks";

export default function AppIndex() {
  const onboardingCompleted = useAppSelector(
    (state) => state.userProfile.onboardingCompleted,
  );

  if (onboardingCompleted) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(onboarding)" />;
}
