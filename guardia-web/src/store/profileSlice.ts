import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ProfileState = {
  userName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

const initialState: ProfileState = {
  userName: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setOnboardingProfile: (
      state,
      action: PayloadAction<{
        userName: string;
        emergencyContactName: string;
        emergencyContactPhone: string;
      }>,
    ) => {
      state.userName = action.payload.userName;
      state.emergencyContactName = action.payload.emergencyContactName;
      state.emergencyContactPhone = action.payload.emergencyContactPhone;
    },
    updateEmergencyContact: (
      state,
      action: PayloadAction<{
        emergencyContactName: string;
        emergencyContactPhone: string;
      }>,
    ) => {
      state.emergencyContactName = action.payload.emergencyContactName;
      state.emergencyContactPhone = action.payload.emergencyContactPhone;
    },
  },
});

export const { setOnboardingProfile, updateEmergencyContact } = profileSlice.actions;
export default profileSlice.reducer;
