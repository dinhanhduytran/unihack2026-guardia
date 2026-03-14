import { useEffect, useState, useMemo, useCallback } from "react";
import Map, {
  Layer,
  Marker,
  Source,
  GeolocateControl,
  NavigationControl,
  type LayerProps,
} from "react-map-gl/mapbox";
import PhoneFrame from "../components/layout/PhoneFrame";
import MelbourneTime from "../components/layout/MelbourneTime";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "../store/hooks";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";
type RouteResponse = {
  routes: Array<{
    geometry: {
      coordinates: [number, number][];
    };
    distance: number;
    duration: number;
  }>;
};

const routeLayer: LayerProps = {
  id: "active-route",
  type: "line",
  paint: {
    "line-color": "#3CB371",
    "line-width": 6,
    "line-opacity": 0.9,
  },
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
};

const routeOutlineLayer: LayerProps = {
  id: "active-route-outline",
  type: "line",
  paint: {
    "line-color": "#2d8f59",
    "line-width": 8,
    "line-opacity": 0.4,
  },
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
};

export default function S5JourneyActive() {
  const destination = useAppSelector((state) => state.location.destination);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    heading: number | null;
  } | null>(null);

  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );

  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  const [viewState, setViewState] = useState({
    latitude: -37.8136,
    longitude: 144.9631,
    zoom: 16,
    bearing: 0,
    pitch: 45,
  });

  const fetchRoute = useCallback(
    async (start: [number, number], end: [number, number]) => {
      if (!MAPBOX_TOKEN) return;

      try {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`,
          { method: "GET" }
        );

        if (!query.ok) {
          throw new Error(`Directions request failed: ${query.status}`);
        }

        const json: RouteResponse = await query.json();
        console.log("Directions API response:", json);

        if (json.routes && json.routes.length > 0) {
          const route = json.routes[0];
          setRouteCoordinates(route.geometry.coordinates);
          setRouteInfo({
            distance: route.distance,
            duration: route.duration,
          });

          console.log("Route fetched:", {
            distance: `${(route.distance / 1000).toFixed(2)} km`,
            duration: `${Math.round(route.duration / 60)} min`,
          });
        } else {
          console.warn("No routes found.");
          setRouteCoordinates([]);
          setRouteInfo(null);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    },
    []
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading,
        };

        setUserLocation(coords);

        setViewState((prev) => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
          bearing: coords.heading ?? prev.bearing,
        }));

        if (
          routeCoordinates.length === 0 &&
          destination?.lat != null &&
          destination?.long != null
        ) {
          fetchRoute(
            [coords.longitude, coords.latitude],
            [destination.long, destination.lat]
          );
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [fetchRoute, routeCoordinates.length, destination?.lat, destination?.long]);

  const routeGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features:
        routeCoordinates.length > 0
          ? [
              {
                type: "Feature" as const,
                properties: {},
                geometry: {
                  type: "LineString" as const,
                  coordinates: routeCoordinates,
                },
              },
            ]
          : [],
    }),
    [routeCoordinates]
  );

  const remainingInfo = useMemo(() => {
    if (!routeInfo) {
      return { eta: "—", distance: "—" };
    }

    const etaMinutes = Math.round(routeInfo.duration / 60);
    const distanceKm = (routeInfo.distance / 1000).toFixed(1);

    return {
      eta: `${etaMinutes} min`,
      distance: `${distanceKm} km`,
    };
  }, [routeInfo]);

  const handleGeolocate = useCallback((e: any) => {
    const coords = {
      latitude: e.coords.latitude,
      longitude: e.coords.longitude,
      heading: e.coords.heading,
    };

    setUserLocation(coords);
    console.log("User location updated:", coords);
  }, []);

  const endPoint =
    destination?.lat != null && destination?.long != null
      ? ([destination.long, destination.lat] as [number, number])
      : routeCoordinates.length > 0
      ? routeCoordinates[routeCoordinates.length - 1]
      : null;

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

      <div
        className="map-wrap"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {MAPBOX_TOKEN ? (
          <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            style={{ width: "100%", height: "100%" }}
          >
            {routeCoordinates.length > 0 && (
              <>
                <Source
                  id="route-outline-source"
                  type="geojson"
                  data={routeGeoJson}
                >
                  <Layer {...routeOutlineLayer} />
                </Source>

                <Source id="route-source" type="geojson" data={routeGeoJson}>
                  <Layer {...routeLayer} />
                </Source>
              </>
            )}

            {endPoint && (
              <Marker
                longitude={endPoint[0]}
                latitude={endPoint[1]}
                anchor="bottom"
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "#E8735A",
                    border: "3px solid white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  🏠
                </div>
              </Marker>
            )}

            {userLocation && (
              <Marker
                latitude={userLocation.latitude}
                longitude={userLocation.longitude}
                anchor="center"
                rotation={userLocation.heading ?? 0}
              >
                <div
                  style={{
                    position: "relative",
                    width: 24,
                    height: 24,
                    transform: "translateY(-12px)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: 0,
                      height: 0,
                      borderLeft: "12px solid transparent",
                      borderRight: "12px solid transparent",
                      borderBottom: "24px solid #2563EB",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "4px",
                      width: 0,
                      height: 0,
                      borderLeft: "8px solid transparent",
                      borderRight: "8px solid transparent",
                      borderBottom: "16px solid white",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "18px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: "#2563EB",
                      border: "3px solid white",
                      boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.3)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                </div>
              </Marker>
            )}

            <GeolocateControl
              position="top-right"
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation={true}
              showUserHeading={true}
              showUserLocation={false}
              onGeolocate={handleGeolocate}
            />

            <NavigationControl position="top-right" showCompass={true} />
          </Map>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f0f0",
              padding: 20,
              textAlign: "center",
            }}
          >
            <div>
              <p>
                Add <code>VITE_MAPBOX_ACCESS_TOKEN</code> in <code>.env</code>{" "}
                to render map.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="hud-row">
        <div className="hud-card">
          <div className="hud-lbl">ETA</div>
          <div className="hud-val">{remainingInfo.eta}</div>
          <div className="hud-sub">{remainingInfo.distance} left</div>
        </div>

        <div className="hud-card">
          <div className="hud-lbl">Safety</div>
          <div className="hud-val" style={{ color: "var(--teal)" }}>
            87
          </div>
          <div
            className="hud-sub"
            style={{
              color: "var(--teal)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span className="dot-status dot-green" /> Safe zone
          </div>
        </div>
      </div>

      <div className="bottom-sheet">
        <div className="drag-handle" />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            className="dot-status dot-green"
            style={{
              animation: "blink 1.6s ease infinite",
              background: "#3CB371",
            }}
          />
          <span style={{ fontSize: 15, fontWeight: 800 }}>On safe route</span>
        </div>

        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: 10,
          }}
        >
          Via Collins St — well-lit path
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Watching:
          </span>
          <div className="avatar-sm" style={{ background: "var(--coral)" }}>
            M
          </div>
          <div
            className="avatar-sm"
            style={{ background: "var(--teal)", marginLeft: -8 }}
          >
            A
          </div>
          <div
            className="avatar-sm"
            style={{ background: "var(--text-muted)", marginLeft: -8 }}
          >
            +1
          </div>
        </div>

        <div className="journey-actions">
          <button
            className="btn-ghost-teal"
            style={{ height: 48, fontSize: 13, borderRadius: 12 }}
          >
            ✅ I&apos;m Home Safe
          </button>

          <button
            className="btn-primary"
            style={{
              height: 48,
              fontSize: 13,
              borderRadius: 12,
              background: "linear-gradient(135deg,#E8735A,#c0392b)",
            }}
          >
            🚨 SOS
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.1);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </PhoneFrame>
  );
}