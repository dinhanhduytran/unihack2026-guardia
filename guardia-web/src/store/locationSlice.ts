import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SavedLocation = {
  address: string;
  lat: number | null;
  long: number | null;
  placeId?: string | null;
};

export type CrimeEvent = {
  id: string;
  lat: number;
  lng: number;
  type: string;
  date: string;
};

export type SelectedRoute = {
  coordinates: [number, number][];
  crime_events: CrimeEvent[];
  safety_score: number;
  distance_km: number;
  eta_minutes: number;
};

type LocationState = {
  origin: SavedLocation | null;
  destination: SavedLocation | null;
  selectedRoute: SelectedRoute | null;
};

const initialState: LocationState = {
  origin: null,
  destination: null,
  selectedRoute: null,
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
    setSelectedRoute: (state, action: PayloadAction<SelectedRoute | null>) => {
      state.selectedRoute = action.payload;
    },
    clearLocations: (state) => {
      state.origin = null;
      state.destination = null;
      state.selectedRoute = null;
    },
  },
});

export const { setOrigin, setDestination, setSelectedRoute, clearLocations } = locationSlice.actions;
export default locationSlice.reducer;
