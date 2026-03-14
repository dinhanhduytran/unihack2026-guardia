import { useState } from "react";
import { Link } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";
import { readPermissionStatus, savePermissionStatus } from "../store/persistence";

type PermissionStateLabel = "idle" | "granted" | "denied" | "unsupported";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

export default function S2Permissions() {
  const [locationStatus, setLocationStatus] = useState<PermissionStateLabel>(readPermissionStatus("location"));
  const [micStatus, setMicStatus] = useState<PermissionStateLabel>(readPermissionStatus("mic"));

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      savePermissionStatus("location", "unsupported");
      console.log("[S2Permissions] Location permission unsupported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationStatus("granted");
        savePermissionStatus("location", "granted");
        console.log("[S2Permissions] Location permission granted");
      },
      (error) => {
        setLocationStatus("denied");
        savePermissionStatus("location", "denied");
        console.log("[S2Permissions] Location permission denied:", error.message);
      },
    );
  };

  const requestMic = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicStatus("unsupported");
      savePermissionStatus("mic", "unsupported");
      console.log("[S2Permissions] Microphone permission unsupported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus("granted");
      savePermissionStatus("mic", "granted");
      console.log("[S2Permissions] Microphone permission granted");

      try {
        const response = await fetch(`${BACKEND_URL}/voice/permission-granted`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: "Help me" }),
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const payload = (await response.json()) as {
          detected: boolean;
          message: string;
          timestamp: string;
        };
        console.log("[S2Permissions] Voice backend response:", payload);
      } catch (apiError) {
        console.log("[S2Permissions] Voice backend call failed:", apiError);
      }
    } catch (error) {
      setMicStatus("denied");
      savePermissionStatus("mic", "denied");
      console.log("[S2Permissions] Microphone permission denied:", error);
    }
  };

  const canGoNext = locationStatus === "granted" && micStatus === "granted";
  const locationButtonLabel = locationStatus === "granted" ? "Granted" : "Allow Location";
  const micButtonLabel = micStatus === "granted" ? "Granted" : "Allow Mic";

  return (
    <PhoneFrame>
      <div style={{ height: 52 }} />
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 16 }}>
        <div className="phone-mock">
          <div className="phone-content">
            <span style={{ fontSize: 28 }}>📍</span>
            <span style={{ fontSize: 22 }}>🎙️</span>
          </div>
        </div>
      </div>
      <div style={{ padding: "20px 28px 0", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Lora, serif", fontStyle: "italic", fontSize: 26, color: "var(--text-primary)", marginBottom: 6 }}>
          Two quick permissions
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
          Guardia needs these to keep you safe.
        </p>
      </div>
      <div className="s2-body">
        <div className="perm-card" style={{ marginBottom: 10 }}>
          <div className="perm-icon">📍</div>
          <div className="perm-info">
            <div className="perm-title">Location Access</div>
            <div className="perm-desc">So we can track your route and alert contacts</div>
          </div>
          <button
            className="btn-sm-coral"
            onClick={requestLocation}
            style={locationStatus === "granted" ? { background: "var(--teal)" } : undefined}
          >
            {locationButtonLabel}
          </button>
        </div>
        <div className="perm-card">
          <div className="perm-icon">🎙️</div>
          <div className="perm-info">
            <div className="perm-title">Voice Commands</div>
            <div className="perm-desc">Say 'Help me' or 'I'm home safe' hands-free</div>
          </div>
          <button
            className="btn-sm-coral"
            onClick={requestMic}
            style={micStatus === "granted" ? { background: "var(--teal)" } : undefined}
          >
            {micButtonLabel}
          </button>
        </div>
        {canGoNext ? (
          <Link to="/home" style={{ width: "100%", marginTop: 16 }}>
            <button className="btn-primary">Next →</button>
          </Link>
        ) : null}
        <div className="progress-dots">
          <div className="pdot" />
          <div className="pdot active" />
        </div>
      </div>
    </PhoneFrame>
  );
}
