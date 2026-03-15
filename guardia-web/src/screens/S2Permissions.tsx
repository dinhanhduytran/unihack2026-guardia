import { useState } from "react";
import { Link } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";
import {
  readPermissionStatus,
  savePermissionStatus,
} from "../store/persistence";

type PermissionStateLabel = "idle" | "granted" | "denied" | "unsupported";

export default function S2Permissions() {
  const [locationStatus, setLocationStatus] = useState<PermissionStateLabel>(
    readPermissionStatus("location"),
  );
  const [micStatus, setMicStatus] = useState<PermissionStateLabel>(
    readPermissionStatus("mic"),
  );

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
        console.log(
          "[S2Permissions] Location permission denied:",
          error.message,
        );
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
    } catch (error) {
      setMicStatus("denied");
      savePermissionStatus("mic", "denied");
      console.log("[S2Permissions] Microphone permission denied:", error);
    }
  };

  const canGoNext = locationStatus === "granted" && micStatus === "granted";
  const locationButtonLabel =
    locationStatus === "granted" ? "Granted" : "Allow Location";
  const micButtonLabel = micStatus === "granted" ? "Granted" : "Allow Mic";

  return (
    <PhoneFrame>
      <div style={{ height: 52 }} />
      <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, paddingTop: 16 }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            fill="var(--coral)"
            fillOpacity="0.18"
            stroke="var(--coral)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9" r="2.5" fill="var(--coral)" />
        </svg>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="9"
            y="2"
            width="6"
            height="11"
            rx="3"
            fill="var(--teal)"
            fillOpacity="0.18"
            stroke="var(--teal)"
            strokeWidth="1.6"
          />
          <path
            d="M5 11a7 7 0 0 0 14 0"
            stroke="var(--teal)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="18"
            x2="12"
            y2="22"
            stroke="var(--teal)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <line
            x1="9"
            y1="22"
            x2="15"
            y2="22"
            stroke="var(--teal)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div style={{ padding: "20px 28px 0", textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 900,
            fontSize: 26,
            color: "var(--text-primary)",
            marginBottom: 6,
            letterSpacing: "-0.3px",
          }}
        >
          Two quick permissions
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-muted)",
            marginBottom: 20,
            lineHeight: 1.55,
          }}
        >
          Guardia needs these to keep you safe.
        </p>
      </div>
      <div className="s2-body">
        <div className="perm-card" style={{ marginBottom: 10 }}>
          <div className="perm-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="var(--coral)"
                fillOpacity="0.25"
                stroke="var(--coral)"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9" r="2.5" fill="var(--coral)" />
            </svg>
          </div>
          <div className="perm-info">
            <div className="perm-title">Location Access</div>
            <div className="perm-desc">
              So we can track your route and alert contacts
            </div>
          </div>
          <button
            className="btn-sm-coral"
            onClick={requestLocation}
            style={
              locationStatus === "granted"
                ? { background: "var(--teal)" }
                : undefined
            }
          >
            {locationButtonLabel}
          </button>
        </div>
        <div className="perm-card">
          <div className="perm-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="9"
                y="2"
                width="6"
                height="11"
                rx="3"
                fill="var(--coral)"
                fillOpacity="0.25"
                stroke="var(--coral)"
                strokeWidth="1.8"
              />
              <path
                d="M5 11a7 7 0 0 0 14 0"
                stroke="var(--coral)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="22"
                stroke="var(--coral)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="9"
                y1="22"
                x2="15"
                y2="22"
                stroke="var(--coral)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="perm-info">
            <div className="perm-title">Voice Commands</div>
            <div className="perm-desc">
              Say 'Help me' or 'I'm home safe' hands-free
            </div>
          </div>
          <button
            className="btn-sm-coral"
            onClick={requestMic}
            style={
              micStatus === "granted"
                ? { background: "var(--teal)" }
                : undefined
            }
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
