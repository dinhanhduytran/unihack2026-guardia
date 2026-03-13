// store/safeRouteSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Location {
  lat: number;
  lng: number;
}

interface Place {
  location: Location | null | undefined;
  description: string;
}

interface RouteSegment {
  coords: [number, number][]; // [lng, lat][]
  safe: boolean;
}

interface Route {
  segments: RouteSegment[];
  safetyScore: number;
  durationMins: number;
  distanceKm: number;
  summary: string;
  incidentCount: number;
}

interface Incident {
  lat: number;
  lng: number;
  severity: number;
  type: string;
}

interface EmergencyContact {
  name: string;
  phone: string;
}

type TrackingStatus = "idle" | "tracking" | "off_route" | "emergency";

interface SafeRouteState {
  // Search
  origin: Place | null;
  destination: Place | null;

  // Routes
  routes: Route[];
  selectedRouteIndex: number;
  incidents: Incident[];

  // Tracking
  trackingStatus: TrackingStatus;
  currentLocation: Location | null;
  offRouteCount: number;

  // Emergency
  emergencyContacts: EmergencyContact[];
  isRecording: boolean;

  // AI
  aiExplanation: string;
}

const initialState: SafeRouteState = {
  origin: null,
  destination: null,

  routes: [],
  selectedRouteIndex: 0,
  incidents: [],

  trackingStatus: "idle",
  currentLocation: null,
  offRouteCount: 0,

  emergencyContacts: [],
  isRecording: false,

  aiExplanation: "",
};

const safeRouteSlice = createSlice({
  name: "safeRoute",
  initialState,
  reducers: {
    // ── Search ──
    setOrigin: (state, action: PayloadAction<Place | null>) => {
      state.origin = action.payload;
    },
    setDestination: (state, action: PayloadAction<Place | null>) => {
      state.destination = action.payload;
    },

    // ── Routes ──
    setRoutes: (state, action: PayloadAction<Route[]>) => {
      state.routes = action.payload;
      state.selectedRouteIndex = 0; // default: safest first
    },
    selectRoute: (state, action: PayloadAction<number>) => {
      state.selectedRouteIndex = action.payload;
    },
    setIncidents: (state, action: PayloadAction<Incident[]>) => {
      state.incidents = action.payload;
    },
    setAiExplanation: (state, action: PayloadAction<string>) => {
      state.aiExplanation = action.payload;
    },

    // ── Tracking ──
    setTrackingStatus: (state, action: PayloadAction<TrackingStatus>) => {
      state.trackingStatus = action.payload;
    },
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
    },
    incrementOffRoute: (state) => {
      state.offRouteCount += 1;
    },
    resetOffRoute: (state) => {
      state.offRouteCount = 0;
    },

    // ── Emergency ──
    setEmergencyContacts: (
      state,
      action: PayloadAction<EmergencyContact[]>,
    ) => {
      state.emergencyContacts = action.payload;
    },
    setIsRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    triggerEmergency: (state) => {
      state.trackingStatus = "emergency";
      state.isRecording = true;
    },

    // ── Reset ──
    resetJourney: (state) => {
      state.routes = [];
      state.incidents = [];
      state.selectedRouteIndex = 0;
      state.trackingStatus = "idle";
      state.offRouteCount = 0;
      state.isRecording = false;
      state.aiExplanation = "";
    },
  },
});

export const {
  setOrigin,
  setDestination,
  setRoutes,
  selectRoute,
  setIncidents,
  setAiExplanation,
  setTrackingStatus,
  setCurrentLocation,
  incrementOffRoute,
  resetOffRoute,
  setEmergencyContacts,
  setIsRecording,
  triggerEmergency,
  resetJourney,
} = safeRouteSlice.actions;

export default safeRouteSlice.reducer;
