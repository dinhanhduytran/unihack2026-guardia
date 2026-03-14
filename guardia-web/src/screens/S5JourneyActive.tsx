import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Map, {
  Layer,
  Marker,
  Source,
  type LayerProps,
} from "react-map-gl/mapbox";
import StreamingAvatar, { AvatarQuality, StreamingEvents } from "@heygen/streaming-avatar";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "../store/hooks";


function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Returns a CSS color: bright red when close, fading to grey at far distances
function proximityColor(distanceMeters: number): string {
  const maxDist = 400; // beyond this → fully grey
  const minDist = 30;  // closer than this → max red
  const t = Math.max(0, Math.min(1, 1 - (distanceMeters - minDist) / (maxDist - minDist)));
  const r = Math.round(232 * t + 150 * (1 - t)); // 232 = red, 150 = grey
  const g = Math.round(30 * t + 150 * (1 - t));
  const b = Math.round(30 * t + 150 * (1 - t));
  return `rgb(${r},${g},${b})`;
}

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
  const navigate = useNavigate();
  const destination = useAppSelector((state) => state.location.destination);
  const storedRoute = useAppSelector((state) => state.location.selectedRoute);
  const emergencyContactPhone = useAppSelector((state) => state.profile.emergencyContactPhone);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    heading: number | null;
  } | null>(null);

  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    storedRoute?.coordinates ?? []
  );

  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(
    storedRoute
      ? { distance: storedRoute.distance_km * 1000, duration: storedRoute.eta_minutes * 60 }
      : null
  );

  const crimeEvents = storedRoute?.crime_events ?? [];

  // HeyGen companion popup
  const [companionOpen, setCompanionOpen] = useState(false);
  const [popupWidth, setPopupWidth] = useState(180);
  const [companionStatus, setCompanionStatus] = useState<"idle" | "loading" | "connected" | "error">("idle");
  const [micActive, setMicActive] = useState(false);
  const companionVideoRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<StreamingAvatar | null>(null);

  const startCompanion = async () => {
    setCompanionStatus("loading");
    try {
      const res = await fetch(`${BACKEND_URL}/companion/start`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json() as { token: string };
      const avatar = new StreamingAvatar({ token: data.token });
      avatarRef.current = avatar;
      avatar.on(StreamingEvents.STREAM_READY, (event: CustomEvent<MediaStream>) => {
        if (companionVideoRef.current && event.detail) {
          companionVideoRef.current.srcObject = event.detail;
          void companionVideoRef.current.play();
        }
        setCompanionStatus("connected");
        avatar.startVoiceChat({ isInputAudioMuted: false })
          .then(() => setMicActive(true))
          .catch(() => {});
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        setCompanionStatus("idle");
        setMicActive(false);
        setCompanionOpen(false);
      });
      await avatar.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: "Ann_Therapist_public",
        knowledgeBase: "You are Guardia, a personal safety AI companion. The user is currently walking. Be warm, calm and reassuring. If they mention feeling unsafe or an emergency, urge them to press SOS immediately.",
      });
    } catch {
      setCompanionStatus("error");
    }
  };

  const stopCompanion = async () => {
    const avatar = avatarRef.current;
    avatarRef.current = null;
    if (!avatar) return;
    try { await avatar.closeVoiceChat(); } catch {}
    try { await avatar.stopAvatar(); } catch {}
    setCompanionStatus("idle");
    setMicActive(false);
    if (companionVideoRef.current) companionVideoRef.current.srcObject = null;
  };

  useEffect(() => {
    return () => { void avatarRef.current?.stopAvatar(); };
  }, []);
  const warnedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userLocation || crimeEvents.length === 0) return;
    crimeEvents.forEach((event) => {
      const dist = haversineMeters(userLocation.latitude, userLocation.longitude, event.lat, event.lng);
      if (dist < 150 && !warnedIds.current.has(event.id)) {
        warnedIds.current.add(event.id);
        const label =
          event.type === "SEXUAL_ASSAULT" ? "sexual assault"
          : event.type === "UNWANTED_PHYSICAL_CONTACT" ? "unwanted physical contact"
          : "street harassment";
        const msg = new SpeechSynthesisUtterance(
          `Warning! A ${label} incident was reported ${Math.round(dist)} metres ahead. Please stay alert.`
        );
        msg.rate = 1;
        msg.pitch = 1;
        window.speechSynthesis.speak(msg);
      }
    });
  }, [userLocation, crimeEvents]);

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

        if (json.routes && json.routes.length > 0) {
          const route = json.routes[0];
          setRouteCoordinates(route.geometry.coordinates);
          setRouteInfo({
            distance: route.distance,
            duration: route.duration,
          });
        } else {
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

  const goHome = useCallback(() => {
    navigate("/home");
  }, [navigate]);

  const handleEmergencyMicCall = useCallback(() => {
    const trimmedPhone = emergencyContactPhone.trim();

    if (!trimmedPhone) {
      window.alert("No emergency contact number found. Please update it in your profile.");
      return;
    }

    const digitsOnly = trimmedPhone.replace(/\D/g, "");
    if (!digitsOnly) {
      window.alert("Emergency contact number is invalid. Please update it in your profile.");
      return;
    }

    const dialNumber = trimmedPhone.startsWith("+") ? `+${digitsOnly}` : digitsOnly;
    window.location.href = `tel:${dialNumber}`;
  }, [emergencyContactPhone]);

  const endPoint =
    destination?.lat != null && destination?.long != null
      ? ([destination.long, destination.lat] as [number, number])
      : routeCoordinates.length > 0
      ? routeCoordinates[routeCoordinates.length - 1]
      : null;

  return (
    <PhoneFrame withNav>
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

            {crimeEvents.map((event) => {
              const dist = userLocation
                ? haversineMeters(userLocation.latitude, userLocation.longitude, event.lat, event.lng)
                : 999;
              const color = proximityColor(dist);
              const scale = dist < 100 ? 1.4 : dist < 200 ? 1.15 : 1;
              return (
                <Marker key={event.id} longitude={event.lng} latitude={event.lat} anchor="center">
                  <div
                    title={`${event.type} · ${event.date} · ${Math.round(dist)}m away`}
                    style={{
                      width: 22 * scale,
                      height: 22 * scale,
                      borderRadius: "50%",
                      backgroundColor: color,
                      border: `2px solid white`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 11 * scale,
                      color: "white",
                      boxShadow: dist < 150 ? `0 0 8px ${color}` : "none",
                      transition: "all 0.5s ease",
                    }}
                  >
                    !
                  </div>
                </Marker>
              );
            })}

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
{/* 
            <GeolocateControl
              position="top-right"
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation={true}
              showUserHeading={true}
              showUserLocation={false}
              onGeolocate={handleGeolocate}
            /> */}

            {/* <NavigationControl position="top-right" showCompass={true} /> */}
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

      {/* Companion popup - above bottom sheet, anchored bottom-left */}
      {companionOpen && (
        <div style={{
          position: "absolute", bottom: 220, left: 12, zIndex: 50,
          width: popupWidth, borderRadius: 16, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          background: "#111",
          transition: "width 0.2s ease",
        }}>
          {/* Zoom controls */}
          <div style={{ position: "absolute", top: 6, right: 6, zIndex: 10, display: "flex", gap: 4 }}>
            <button
              onClick={() => setPopupWidth((w) => Math.min(w + 40, 320))}
              style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", fontSize: 14, cursor: "pointer", lineHeight: 1 }}
            >+</button>
            <button
              onClick={() => setPopupWidth((w) => Math.max(w - 40, 120))}
              style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", fontSize: 14, cursor: "pointer", lineHeight: 1 }}
            >−</button>
          </div>
          <div style={{ width: "100%", aspectRatio: "3/4", position: "relative" }}>
            <video
              ref={companionVideoRef}
              autoPlay
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: companionStatus === "connected" ? "block" : "none" }}
            />
            {companionStatus !== "connected" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ fontSize: 32 }}>🛡️</div>
                {companionStatus === "loading" && <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Connecting...</div>}
                {companionStatus === "error" && (
                  <>
                    <div style={{ color: "#E8735A", fontSize: 11 }}>Failed</div>
                    <button onClick={() => void startCompanion()} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, background: "#E8735A", color: "#fff", border: "none", cursor: "pointer" }}>Retry</button>
                  </>
                )}
              </div>
            )}
            {companionStatus === "connected" && (
              <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
                <button
                  onClick={() => {
                    if (micActive) { void avatarRef.current?.closeVoiceChat().then(() => setMicActive(false)); }
                    else { void avatarRef.current?.startVoiceChat({ isInputAudioMuted: false }).then(() => setMicActive(true)); }
                  }}
                  style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, background: micActive ? "rgba(16,185,129,0.8)" : "rgba(255,255,255,0.2)", color: "#fff", border: "none", cursor: "pointer" }}
                >
                  {micActive ? "🎙 On" : "🎙 Off"}
                </button>
                <button
                  onClick={() => { void stopCompanion(); setCompanionOpen(false); }}
                  style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, background: "rgba(232,115,90,0.85)", color: "#fff", border: "none", cursor: "pointer" }}
                >
                  End
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="hud-row" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="hud-card">
            <div className="hud-lbl">ETA</div>
            <div className="hud-val">{remainingInfo.eta}</div>
            <div className="hud-sub">{remainingInfo.distance} left</div>
          </div>
          <button
            type="button"
            aria-label="Call emergency contact"
            onClick={handleEmergencyMicCall}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.8)",
              background: "rgba(37, 99, 235, 0.95)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 22px rgba(37, 99, 235, 0.35)",
              cursor: "pointer",
              marginLeft: 6,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3.5a3 3 0 0 1 3 3v4.5a3 3 0 0 1-6 0V6.5a3 3 0 0 1 3-3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 10.5v.5A5.5 5.5 0 0 0 12 16.5a5.5 5.5 0 0 0 5.5-5.5v-.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 16.5V20M9 20h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="hud-card">
          <div className="hud-lbl">Safety</div>
          <div className="hud-val" style={{ color: storedRoute && storedRoute.safety_score >= 60 ? "var(--teal)" : "var(--coral)" }}>
            {storedRoute?.safety_score ?? "—"}
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
            onClick={() => {
              setCompanionOpen((o) => !o);
              if (!companionOpen && companionStatus === "idle") void startCompanion();
            }}
            style={{
              height: 48, fontSize: 13, borderRadius: 12, border: "none", cursor: "pointer",
              background: companionStatus === "connected" ? "#10b981" : "rgba(232,115,90,0.15)",
              color: companionStatus === "connected" ? "#fff" : "#E8735A",
              fontWeight: 700,
            }}
          >
            🛡️ AI Call
          </button>

          <button
            className="btn-ghost-teal"
            style={{ height: 48, fontSize: 13, borderRadius: 12 }}
            onClick={goHome}
          >
            ✅ Safe
          </button>

          <button
            className="btn-primary"
            style={{ height: 48, fontSize: 13, borderRadius: 12, background: "linear-gradient(135deg,#E8735A,#c0392b)" }}
            onClick={goHome}
          >
            Exit
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