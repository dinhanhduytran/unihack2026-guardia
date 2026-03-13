import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SavedLocation = {
  address: string;
  lat: number | null;
  long: number | null;
  placeId?: string | null;
};

type LocationState = {
  origin: SavedLocation | null;
  destination: SavedLocation | null;
};

const initialState: LocationState = {
  origin: null,
  destination: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setOrigin: (state, action: PayloadAction<SavedLocation | null>) => {
      state.origin = action.payload;
    },
    setDestination: (state, action: PayloadAction<SavedLocation | null>) => {
      state.destination = action.payload;
    },
    clearLocations: (state) => {
      state.origin = null;
      state.destination = null;
    },
  },
});

export const { setOrigin, setDestination, clearLocations } = locationSlice.actions;
export default locationSlice.reducer;
