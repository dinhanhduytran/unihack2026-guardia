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
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";

// Destination coordinates (example: a point in Melbourne)
const DESTINATION: [number, number] = [145.0070, -37.71677];

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
    pitch: 45, // Slight tilt for navigation view
  });

  // Fetch route from Mapbox Directions API
  const fetchRoute = useCallback(
    async (start: [number, number], end: [number, number]) => {
      if (!MAPBOX_TOKEN) return;

      try {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`,
          { method: "GET" }
        );

        const json: RouteResponse = await query.json();
        
        console.log(json);

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
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    },
    []
  );

  // Get user's current location and fetch route
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
          heading: position.coords.heading, // Device direction
        };

        setUserLocation(coords);

        // Center map on user location
        setViewState((prev) => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
          bearing: coords.heading ?? prev.bearing, // Rotate map with user direction
        }));

        // Fetch route on first location update
        if (routeCoordinates.length === 0) {
          fetchRoute([coords.longitude, coords.latitude], DESTINATION);
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
  }, [fetchRoute, routeCoordinates.length]);

  // Create GeoJSON for the route
  const routeGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: routeCoordinates,
          },
        },
      ],
    }),
    [routeCoordinates]
  );

  // Calculate ETA and distance remaining
  const remainingInfo = useMemo(() => {
    if (!routeInfo) return { eta: "8 min", distance: "0.6 km" };

    const etaMinutes = Math.round(routeInfo.duration / 60);
    const distanceKm = (routeInfo.distance / 1000).toFixed(1);

    return {
      eta: `${etaMinutes} min`,
      distance: `${distanceKm} km`,
    };
  }, [routeInfo]);

  // Handle geolocation updates from GeolocateControl
  const handleGeolocate = useCallback((e: any) => {
    const coords = {
      latitude: e.coords.latitude,
      longitude: e.coords.longitude,
      heading: e.coords.heading,
    };
    setUserLocation(coords);
    console.log("User location updated:", coords);
  }, []);

  const endPoint = routeCoordinates[routeCoordinates.length - 1];

  return (
    <PhoneFrame withNav>
      <div className="status-bar">
        <span className="status-time">9:41</span>
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

      {/* MAPBOX MAP */}
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
            {/* Route outline (below main route) */}
            {routeCoordinates.length > 0 && (
              <>
                <Source
                  id="route-outline-source"
                  type="geojson"
                  data={routeGeoJson}
                >
                  <Layer {...routeOutlineLayer} />
                </Source>

                {/* Main route */}
                <Source id="route-source" type="geojson" data={routeGeoJson}>
                  <Layer {...routeLayer} />
                </Source>
              </>
            )}

            {/* Destination marker */}
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

            {/* User location marker - directional arrow */}
            {userLocation && (
              <Marker
                latitude={userLocation.latitude}
                longitude={userLocation.longitude}
                anchor="center"
                rotation={userLocation.heading ?? 0}
              >
                {/* Directional navigation arrow */}
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "12px solid transparent",
                    borderRight: "12px solid transparent",
                    borderBottom: "24px solid #2563EB",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    transform: "translateY(-50%)",
                  }}
                >
                  {/* White stroke for visibility */}
                  <div
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: "-10px",
                      width: 0,
                      height: 0,
                      borderLeft: "10px solid transparent",
                      borderRight: "10px solid transparent",
                      borderBottom: "20px solid white",
                    }}
                  />
                </div>
                {/* Blue pulsing dot at base */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: "#2563EB",
                    border: "3px solid white",
                    boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.3)",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
              </Marker>
            )}

            {/* Geolocate Control - tracks user location */}
            <GeolocateControl
              position="top-right"
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation={true}
              showUserHeading={true}
              showUserLocation={false} // We're using custom marker
              onGeolocate={handleGeolocate}
            />

            {/* Navigation Control - zoom buttons */}
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

      {/* HUD overlay */}
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

      {/* Bottom sheet */}
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

      {/* Add pulse animation */}
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