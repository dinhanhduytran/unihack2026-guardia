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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

type BackendPoint = {
  geometry: { coordinates: [number, number]; type: "Point" };
  distance: number;
  duration: number;
  weight: number;
};

type CrimeEvent = {
  id: string;
  lat: number;
  lng: number;
  type: string;
  date: string;
};

type BackendRouteRaw = {
  distance: number;
  duration: number;
  safety_score: number;
  points: BackendPoint[];
  crime_events: CrimeEvent[];
};

type BackendRoute = {
  id: string;
  label: string;
  distance_km: number;
  eta_minutes: number;
  safety_score: number;
  recommended: boolean;
  routes: [number, number][];
  points: BackendPoint[];
  crime_events: CrimeEvent[];
};

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

  const [routeOptions, setRouteOptions] = useState<BackendRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [routesError, setRoutesError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!mapboxToken.trim()) {
      setRouteOptions([]);
      setRoutesLoading(false);
      setRoutesError(null);
      return;
    }

    if (
      origin?.lat == null ||
      origin?.long == null ||
      destination?.lat == null ||
      destination?.long == null
    ) {
      setRouteOptions([]);
      setRoutesLoading(false);
      setRoutesError(null);
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        setRoutesLoading(true);
        setRoutesError(null);

        const response = await fetch(
          `${BACKEND_URL}/routes?origin_lat=${origin.lat}&origin_lng=${origin.long}&dest_lat=${destination.lat}&dest_lng=${destination.long}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Routes request failed: ${response.status}`);
        }

        const raw = (await response.json()) as BackendRouteRaw[];

        const bestScore = Math.max(...raw.map((r) => r.safety_score));
        const mappedRoutes: BackendRoute[] = raw.map((route, index) => {
          const coords = route.points.map(
            (p) => p.geometry.coordinates as [number, number],
          );
          return {
            id: `route-${index + 1}`,
            label: `Route ${index + 1}`,
            distance_km: Number((route.distance / 1000).toFixed(1)),
            eta_minutes: Math.max(1, Math.round(route.duration / 60)),
            safety_score: route.safety_score,
            recommended: route.safety_score === bestScore,
            routes: coords,
            points: route.points,
            crime_events: route.crime_events,
          };
        });

        setRouteOptions(mappedRoutes);
        setSelectedRouteId(mappedRoutes[0]?.id ?? null);

        if (mappedRoutes.length === 0) {
          setRoutesError("No walking routes found for this destination.");
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setRouteOptions([]);
        setSelectedRouteId(null);
        setRoutesError("Unable to load routes right now.");
      } finally {
        setRoutesLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [destination?.lat, destination?.long, mapboxToken, origin?.lat, origin?.long]);

  const selectedRoute = useMemo(
    () =>
      routeOptions.find((route) => route.id === selectedRouteId) ??
      routeOptions[0] ??
      null,
    [routeOptions, selectedRouteId],
  );


  const selectedRouteGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: selectedRoute
        ? [
            {
              type: "Feature" as const,
              properties: { id: selectedRoute.id },
              geometry: {
                type: "LineString" as const,
                coordinates: selectedRoute.routes,
              },
            },
          ]
        : [],
    }),
    [selectedRoute],
  );

  const otherRoutesGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: routeOptions
        .filter((route) => route.id !== selectedRoute?.id)
        .map((route) => ({
          type: "Feature" as const,
          properties: { id: route.id },
          geometry: {
            type: "LineString" as const,
            coordinates: route.routes,
          },
        })),
    }),
    [routeOptions, selectedRoute?.id],
  );


const initialViewState = useMemo(() => {
  if (
    origin?.lat != null &&
    origin?.long != null &&
    destination?.lat != null &&
    destination?.long != null
  ) {
    return {
      latitude: (origin.lat + destination.lat) / 2,
      longitude: (origin.long + destination.long) / 2,
      zoom: 12,
    };
  }

  if (origin?.lat != null && origin?.long != null) {
    return {
      latitude: origin.lat,
      longitude: origin.long,
      zoom: 14,
    };
  }

  if (destination?.lat != null && destination?.long != null) {
    return {
      latitude: destination.lat,
      longitude: destination.long,
      zoom: 14,
    };
  }

  return {
    latitude: -37.8064,
    longitude: 144.9644,
    zoom: 13,
  };
}, [origin?.lat, origin?.long, destination?.lat, destination?.long]);


  const startPoint = useMemo(
    () => (selectedRoute ? selectedRoute.routes[0] ?? null : null),
    [selectedRoute],
  );

  const endPoint = useMemo(
    () =>
      selectedRoute
        ? selectedRoute.routes[selectedRoute.routes.length - 1] ?? null
        : null,
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

      <div className="map-wrap" style={{ position: "relative" }}>
        {mapboxToken ? (
          <Map
            mapboxAccessToken={mapboxToken}
            initialViewState={initialViewState}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            style={{ width: "100%", height: "100%" }}
          >
            {routeOptions.length > 1 ? (
              <Source
                id="other-routes-source"
                type="geojson"
                data={otherRoutesGeoJson}
              >
                <Layer {...otherRouteLayer} />
              </Source>
            ) : null}

            {selectedRoute ? (
              <Source
                id="selected-route-source"
                type="geojson"
                data={selectedRouteGeoJson}
              >
                <Layer {...selectedRouteLayer} />
              </Source>
            ) : null}

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

            {(selectedRoute?.crime_events ?? []).map((event) => (
              <Marker
                key={event.id}
                longitude={event.lng}
                latitude={event.lat}
                anchor="center"
              >
                <div
                  className={`incident-marker ${
                    event.type === "SEXUAL_ASSAULT"
                      ? "incident-high"
                      : event.type === "UNWANTED_PHYSICAL_CONTACT"
                        ? "incident-medium"
                        : "incident-low"
                  }`}
                  title={`${event.type} · ${event.date}`}
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

        <div className="custom-drawer">
          <div className="custom-drawer-handle-wrap">
            <div className="drag-handle" />
          </div>

          <div className="custom-drawer-head">
            <div className="custom-drawer-title">Suggested routes</div>
            <div className="custom-drawer-subtitle">
              Pick the safest option for tonight
            </div>
          </div>

          <div className="custom-route-scroll">
            {routesLoading ? (
              <div className="custom-empty-card">Loading routes...</div>
            ) : null}

            {!routesLoading && routesError ? (
              <div className="custom-empty-card">{routesError}</div>
            ) : null}

            {!routesLoading &&
            !routesError &&
            routeOptions.length === 0 &&
            destination?.address ? (
              <div className="custom-empty-card">
                Select a destination with coordinates to load routes.
              </div>
            ) : null}

            {!routesLoading &&
            !routesError &&
            routeOptions.length === 0 &&
            !destination?.address ? (
              <div className="custom-empty-card">
                Search for a destination to see route options.
              </div>
            ) : null}

            {routeOptions.map((route) => {
              const isSelected = route.id === selectedRoute?.id;
              const scoreColor =
                route.safety_score >= 80
                  ? "var(--teal)"
                  : route.safety_score >= 60
                    ? "var(--amber)"
                    : "var(--coral)";

              return (
                <button
                  key={route.id}
                  className={`custom-route-card ${isSelected ? "sel" : ""}`}
                  type="button"
                  onClick={() => setSelectedRouteId(route.id)}
                >
                  <div className="custom-route-top">
                    <div className="custom-route-title">{route.label}</div>
                    <div
                      className="custom-route-score"
                      style={{ color: scoreColor }}
                    >
                      {route.safety_score}
                    </div>
                  </div>

                  <div className="custom-route-meta">
                    {route.eta_minutes} min · {route.distance_km} km
                  </div>

                  {route.recommended ? (
                    <span className="custom-badge custom-badge-good">
                      Safest
                    </span>
                  ) : (
                    <span className="custom-badge custom-badge-warn">
                      ▲ score {route.safety_score}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="custom-drawer-footer">
            <Link to="/journey" style={{ textDecoration: "none", width: "100%" }}>
              <button className="btn-primary custom-drawer-btn" disabled={!selectedRoute}>
                Start Journey →
              </button>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .custom-drawer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 20;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-top-left-radius: 22px;
          border-top-right-radius: 22px;
          box-shadow: 0 -8px 26px rgba(15, 23, 42, 0.14);
          padding: 8px 12px 12px;
        }

        .custom-drawer-handle-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 6px;
        }

        .custom-drawer-head {
          margin-bottom: 10px;
        }

        .custom-drawer-title {
          font-size: 14px;
          font-weight: 800;
          color: var(--text, #111827);
          line-height: 1.2;
        }

        .custom-drawer-subtitle {
          margin-top: 2px;
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.3;
        }

        .custom-route-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .custom-route-scroll::-webkit-scrollbar {
          display: none;
        }

        .custom-route-card {
          flex: 0 0 155px;
          min-height: 84px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 14px;
          background: #fff;
          padding: 10px;
          text-align: left;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
          transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
        }

        .custom-route-card.sel {
          border-color: rgba(232, 115, 90, 0.45);
          box-shadow: 0 8px 18px rgba(232, 115, 90, 0.12);
          transform: translateY(-1px);
        }

        .custom-route-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
        }

        .custom-route-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text, #111827);
          line-height: 1.25;
        }

        .custom-route-score {
          font-size: 16px;
          font-weight: 800;
          line-height: 1;
          flex-shrink: 0;
        }

        .custom-route-meta {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .custom-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 22px;
          padding: 0 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
        }

        .custom-badge-good {
          background: rgba(16, 185, 129, 0.12);
          color: var(--teal);
        }

        .custom-badge-warn {
          background: rgba(245, 158, 11, 0.12);
          color: var(--amber);
        }

        .custom-empty-card {
          min-width: 100%;
          font-size: 12px;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(15, 23, 42, 0.06);
          border-radius: 14px;
          padding: 12px;
        }

        .custom-drawer-footer {
          margin-top: 8px;
        }

        .custom-drawer-btn {
          width: 100%;
          height: 44px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
        }
      `}</style>
    </PhoneFrame>
  );
}