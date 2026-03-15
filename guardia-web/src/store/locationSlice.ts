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

export type RecentRoute = {
  id: string;
  destination: SavedLocation;
  origin: SavedLocation | null;
  distance_km: number | null;
  eta_minutes: number | null;
  safety_score: number | null;
  completedAt: string;
};

type LocationState = {
  origin: SavedLocation | null;
  destination: SavedLocation | null;
  selectedRoute: SelectedRoute | null;
  recentRoutes: RecentRoute[];
};

const initialState: LocationState = {
  origin: null,
  destination: null,
  selectedRoute: null,
  recentRoutes: [],
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
    loadRecentRoutes: (state, action: PayloadAction<RecentRoute[]>) => {
      state.recentRoutes = action.payload;
    },
    addRecentRoute: (state, action: PayloadAction<RecentRoute>) => {
      const candidate = action.payload;
      const deduped = state.recentRoutes.filter((route) => {
        const sameCoords =
          route.destination.lat === candidate.destination.lat &&
          route.destination.long === candidate.destination.long;
        const sameAddress =
          route.destination.address.trim().toLowerCase() ===
          candidate.destination.address.trim().toLowerCase();
        return !(sameCoords || sameAddress);
      });
      state.recentRoutes = [candidate, ...deduped].slice(0, 5);
    },
    clearLocations: (state) => {
      state.origin = null;
      state.destination = null;
      state.selectedRoute = null;
    },
  },
});

export const {
  setOrigin,
  setDestination,
  setSelectedRoute,
  loadRecentRoutes,
  addRecentRoute,
  clearLocations,
} = locationSlice.actions;
export default locationSlice.reducer;
