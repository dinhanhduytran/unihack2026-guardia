import { Link } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";
import PlaceSearchInput from "../components/location/PlaceSearchInput";
import MelbourneTime from "../components/layout/MelbourneTime";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setOrigin } from "../store/locationSlice";
import { useEffect, useMemo, useState } from "react";
import Map, {
  Layer,
  Marker,
  Source,
  type LayerProps,
} from "react-map-gl/mapbox";

type BackendRoute = {
  id: string;
  label: string;
  distance_km: number;
  eta_minutes: number;
  safety_score: number;
  total_risk: number;
  crime_count: number;
  route_events: unknown[];
  recommended: boolean;
  routes: [number, number][];
};

const MOCK_BACKEND_ROUTES: BackendRoute[] = [
  {
    id: "r1",
    label: "Via Collins St",
    distance_km: 1.1,
    eta_minutes: 14,
    safety_score: 87,
    total_risk: 2.15,
    crime_count: 2,
    route_events: [],
    recommended: true,
    routes: [
      [144.9632, -37.8083],
      [144.9642, -37.8072],
      [144.966, -37.8058],
    ],
  },
  {
    id: "r2",
    label: "Via Flinders Ln",
    distance_km: 0.9,
    eta_minutes: 11,
    safety_score: 52,
    total_risk: 5.4,
    crime_count: 4,
    route_events: [],
    recommended: false,
    routes: [
      [144.9632, -37.8083],
      [144.9649, -37.8075],
      [144.966, -37.8058],
    ],
  },
  {
    id: "r3",
    label: "Via Swanston St",
    distance_km: 1.3,
    eta_minutes: 16,
    safety_score: 76,
    total_risk: 3.1,
    crime_count: 1,
    route_events: [],
    recommended: false,
    routes: [
      [144.9632, -37.8083],
      [144.9638, -37.8067],
      [144.966, -37.8058],
    ],
  },
];

const selectedRouteLayer: LayerProps = {
  id: "selected-route",
  type: "line",
  paint: {
    "line-color": "#E8735A",
    "line-width": 6,
    "line-opacity": 0.95,
  },
};

const otherRouteLayer: LayerProps = {
  id: "other-routes",
  type: "line",
  paint: {
    "line-color": "#B0958F",
    "line-width": 3,
    "line-opacity": 0.45,
  },
};

const DUMMY_INCIDENTS = [
  { id: "inc-1", latitude: -37.8076, longitude: 144.9649, radius_m: 30 },
  { id: "inc-2", latitude: -37.8069, longitude: 144.9637, radius_m: 10 },
  { id: "inc-3", latitude: -37.8057, longitude: 144.9651, radius_m: 50 },
] as const;

const incidentZoneFillLayer: LayerProps = {
  id: "incident-zone-fill",
  type: "fill",
  paint: {
    "fill-color": "#E8735A",
    "fill-opacity": 0.14,
  },
};

const incidentZoneStrokeLayer: LayerProps = {
  id: "incident-zone-stroke",
  type: "line",
  paint: {
    "line-color": "#E8735A",
    "line-opacity": 0.35,
    "line-width": 1.5,
  },
};

function createCirclePolygon(
  centerLng: number,
  centerLat: number,
  radiusMeters: number,
  steps = 48,
): [number, number][] {
  const earthRadiusMeters = 6378137;
  const latRadians = (centerLat * Math.PI) / 180;
  const lngRadians = (centerLng * Math.PI) / 180;
  const angularDistance = radiusMeters / earthRadiusMeters;

  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i += 1) {
    const bearing = (2 * Math.PI * i) / steps;

    const pointLat = Math.asin(
      Math.sin(latRadians) * Math.cos(angularDistance) +
        Math.cos(latRadians) * Math.sin(angularDistance) * Math.cos(bearing),
    );
    const pointLng =
      lngRadians +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRadians),
        Math.cos(angularDistance) - Math.sin(latRadians) * Math.sin(pointLat),
      );

    points.push([(pointLng * 180) / Math.PI, (pointLat * 180) / Math.PI]);
  }

  return points;
}

function getIncidentClassName(radiusMeters: number) {
  if (radiusMeters >= 140) return "incident-high";
  if (radiusMeters >= 90) return "incident-medium";
  return "incident-low";
}

export default function S4MapPreJourney() {
  const dispatch = useAppDispatch();
  const origin = useAppSelector((state) => state.location.origin);
  const destination = useAppSelector((state) => state.location.destination);
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";
  const [selectedRouteId, setSelectedRouteId] = useState(
    MOCK_BACKEND_ROUTES.find((route) => route.recommended)?.id ??
      MOCK_BACKEND_ROUTES[0].id,
  );

  useEffect(() => {
    if (origin?.lat != null && origin?.long != null) {
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch(
          setOrigin({
            address: "Current location",
            lat: position.coords.latitude,
            long: position.coords.longitude,
            placeId: null,
          }),
        );
      },
      () => {
        // no-op: user can still set origin manually later
      },
    );
  }, [dispatch, origin?.lat, origin?.long]);

  const selectedRoute = useMemo(
    () =>
      MOCK_BACKEND_ROUTES.find((route) => route.id === selectedRouteId) ??
      MOCK_BACKEND_ROUTES[0],
    [selectedRouteId],
  );

  const selectedRouteGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: { id: selectedRoute.id },
          geometry: {
            type: "LineString" as const,
            coordinates: selectedRoute.routes,
          },
        },
      ],
    }),
    [selectedRoute],
  );

  const otherRoutesGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: MOCK_BACKEND_ROUTES.filter(
        (route) => route.id !== selectedRoute.id,
      ).map((route) => ({
        type: "Feature" as const,
        properties: { id: route.id },
        geometry: {
          type: "LineString" as const,
          coordinates: route.routes,
        },
      })),
    }),
    [selectedRoute.id],
  );

  const mapCenter = useMemo(() => {
    if (origin?.lat != null && origin?.long != null) {
      return {
        latitude: origin.lat,
        longitude: origin.long,
      };
    }
    return {
      latitude: -37.8064,
      longitude: 144.9644,
    };
  }, [origin]);

  const startPoint = useMemo(
    () => selectedRoute.routes[0] ?? null,
    [selectedRoute],
  );
  const endPoint = useMemo(
    () => selectedRoute.routes[selectedRoute.routes.length - 1] ?? null,
    [selectedRoute],
  );

  const incidentZonesGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: DUMMY_INCIDENTS.map((incident) => ({
        type: "Feature" as const,
        properties: { id: incident.id, radius_m: incident.radius_m },
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            createCirclePolygon(
              incident.longitude,
              incident.latitude,
              incident.radius_m,
            ),
          ],
        },
      })),
    }),
    [],
  );

  return (
    <PhoneFrame withNav>
      <div className="status-bar">
        <MelbourneTime className="status-time" />
        <div className="status-icons">
          <div className="signal-bars">
            <span />
            <span />
            <span />
          </div>
          <span className="wifi-icon">▲</span>
          <div className="battery">
            <div className="battery-fill" />
          </div>
        </div>
      </div>
      <div className="map-wrap">
        {mapboxToken ? (
          <Map
            mapboxAccessToken={mapboxToken}
  
            mapStyle="mapbox://styles/mapbox/light-v11"
            style={{ width: "100%", height: "100%" }}
          >
            <Source
              id="other-routes-source"
              type="geojson"
              data={otherRoutesGeoJson}
            >
              <Layer {...otherRouteLayer} />
            </Source>
            <Source
              id="selected-route-source"
              type="geojson"
              data={selectedRouteGeoJson}
            >
              <Layer {...selectedRouteLayer} />
            </Source>
            <Source
              id="incident-zones-source"
              type="geojson"
              data={incidentZonesGeoJson}
            >
              <Layer {...incidentZoneFillLayer} />
              <Layer {...incidentZoneStrokeLayer} />
            </Source>
            {startPoint ? (
              <Marker
                longitude={startPoint[0]}
                latitude={startPoint[1]}
                anchor="bottom"
              >
                <div className="route-pin route-pin-start">
                  <span className="route-pin-dot">S</span>
                  <span className="route-pin-label">Start</span>
                </div>
              </Marker>
            ) : null}
            {endPoint ? (
              <Marker
                longitude={endPoint[0]}
                latitude={endPoint[1]}
                anchor="bottom"
              >
                <div className="route-pin route-pin-end">
                  <span className="route-pin-dot">E</span>
                  <span className="route-pin-label">End</span>
                </div>
              </Marker>
            ) : null}
            {DUMMY_INCIDENTS.map((incident) => (
              <Marker
                key={incident.id}
                longitude={incident.longitude}
                latitude={incident.latitude}
                anchor="center"
              >
                <div
                  className={`incident-marker ${getIncidentClassName(
                    incident.radius_m,
                  )}`}
                  title={`Incident radius ${incident.radius_m}m`}
                >
                  <span>!</span>
                </div>
              </Marker>
            ))}
            {origin?.lat != null && origin?.long != null ? (
              <Marker
                latitude={origin.lat}
                longitude={origin.long}
                anchor="center"
              >
                <div className="user-dot-live" />
              </Marker>
            ) : null}
          </Map>
        ) : (
          <div className="mapbox-token-warning">
            Add <code>VITE_MAPBOX_ACCESS_TOKEN</code> in <code>.env</code> to
            render map.
          </div>
        )}
        <PlaceSearchInput
          kind="destination"
          placeholder="Where are you heading?"
          className="map-search"
          iconRight="⚙️"
        />
        <div className="bottom-sheet">
          <div className="drag-handle" />
          <div className="location-state-card" style={{ marginBottom: 10 }}>
            <div>
              <strong>Origin:</strong>{" "}
              {origin?.address ?? "Current location not set"}
            </div>
            <div>
              {origin?.lat != null && origin?.long != null
                ? `${origin.lat}, ${origin.long}`
                : "No coordinates"}
            </div>
            <div style={{ marginTop: 6 }}>
              <strong>Destination:</strong> {destination?.address ?? "Not set"}
            </div>
            <div>
              {destination?.lat != null && destination?.long != null
                ? `${destination.lat}, ${destination.long}`
                : "No coordinates"}
            </div>
          </div>
          <div className="section-head">Suggested for tonight</div>
          <div className="route-scroll">
            {MOCK_BACKEND_ROUTES.map((route) => {
              const isSelected = route.id === selectedRoute.id;
              const scoreColor =
                route.safety_score >= 80
                  ? "var(--teal)"
                  : route.safety_score >= 60
                    ? "var(--amber)"
                    : "var(--coral)";

              return (
                <button
                  key={route.id}
                  className={`rcard ${isSelected ? "sel" : ""}`}
                  type="button"
                  onClick={() => setSelectedRouteId(route.id)}
                >
                  <div className="rcard-via">{route.label}</div>
                  <div className="rcard-score" style={{ color: scoreColor }}>
                    {route.safety_score}
                  </div>
                  <div className="rcard-meta">
                    {route.eta_minutes} min · {route.distance_km} km
                  </div>
                  {route.recommended ? (
                    <span className="badge badge-teal">+ Safest</span>
                  ) : (
                    <span className="badge badge-amber">
                      ▲ {route.crime_count} incidents
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <Link to="/journey">
            <button className="btn-primary">Start Journey →</button>
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}