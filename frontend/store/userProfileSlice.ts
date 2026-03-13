import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserProfileState = {
  name: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allowNotifications: boolean;
  onboardingCompleted: boolean;
};

const initialState: UserProfileState = {
  name: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  allowNotifications: true,
  onboardingCompleted: false,
};

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    saveOnboardingProfile: (
      state,
      action: PayloadAction<Omit<UserProfileState, "onboardingCompleted">>,
    ) => {
      state.name = action.payload.name;
      state.emergencyContactName = action.payload.emergencyContactName;
      state.emergencyContactPhone = action.payload.emergencyContactPhone;
      state.allowNotifications = action.payload.allowNotifications;
      state.onboardingCompleted = true;
    },
  },
});

export const { saveOnboardingProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;
