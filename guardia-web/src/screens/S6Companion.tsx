import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
} from "@heygen/streaming-avatar";
import PhoneFrame from "../components/layout/PhoneFrame";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

type SessionData = {
  token: string;
};

export default function S6Companion() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "connected" | "error">("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [micActive, setMicActive] = useState(false);

  const startSession = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`${BACKEND_URL}/companion/start`, { method: "POST" });
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const data = (await res.json()) as SessionData;

      const avatar = new StreamingAvatar({ token: data.token });
      avatarRef.current = avatar;

      avatar.on(StreamingEvents.STREAM_READY, (event: CustomEvent<MediaStream>) => {
        if (videoRef.current && event.detail) {
          videoRef.current.srcObject = event.detail;
          void videoRef.current.play();
        }
        setStatus("connected");
        avatar.startVoiceChat({ isInputAudioMuted: false })
          .then(() => setMicActive(true))
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : "Mic unavailable";
            setMicError(msg);
          });
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        setStatus("idle");
      });

      const sessionInfo = await avatar.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: "Ann_Therapist_public",
      });

      setSessionId(sessionInfo?.session_id ?? null);
    } catch {
      setStatus("error");
    }
  };

  const stopSession = async () => {
    const avatar = avatarRef.current;
    avatarRef.current = null;
    if (!avatar) return;
    try { await avatar.closeVoiceChat(); } catch {}
    try { await avatar.stopAvatar(); } catch {}
    setSessionId(null);
    setStatus("idle");
    setMicActive(false);
    setMicError(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const speak = async (text: string) => {
    await avatarRef.current?.speak({
      text,
      task_type: TaskType.REPEAT,
    });
  };

  useEffect(() => {
    return () => {
      void avatarRef.current?.stopAvatar();
    };
  }, []);

  return (
    <PhoneFrame withNav>
      <div className="companion-body" style={{ padding: 0, position: "relative" }}>
        {/* Video area */}
        <div style={{ width: "100%", aspectRatio: "9/14", background: "#111", position: "relative", overflow: "hidden" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: status === "connected" ? "block" : "none" }}
          />

          {status !== "connected" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ fontSize: 48 }}>🛡️</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Guardia AI Companion</div>
              {status === "loading" && (
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Connecting...</div>
              )}
              {status === "error" && (
                <div style={{ color: "#E8735A", fontSize: 13 }}>Connection failed. Try again.</div>
              )}
              {(status === "idle" || status === "error") && (
                <button
                  onClick={() => void startSession()}
                  style={{ marginTop: 8, padding: "10px 28px", borderRadius: 999, background: "#E8735A", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}
                >
                  Start Video Call
                </button>
              )}
            </div>
          )}

          {status === "connected" && (
            <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {micError && (
                <div style={{ fontSize: 11, color: "#fca5a5", background: "rgba(0,0,0,0.5)", padding: "4px 12px", borderRadius: 999 }}>
                  Mic: {micError}
                </div>
              )}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => {
                    if (micActive) {
                      void avatarRef.current?.closeVoiceChat().then(() => setMicActive(false));
                    } else {
                      avatarRef.current?.startVoiceChat({ isInputAudioMuted: false })
                        .then(() => { setMicActive(true); setMicError(null); })
                        .catch((err: unknown) => setMicError(err instanceof Error ? err.message : "Mic error"));
                    }
                  }}
                  style={{ padding: "8px 16px", borderRadius: 999, background: micActive ? "rgba(16,185,129,0.7)" : "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, border: "none", cursor: "pointer", backdropFilter: "blur(6px)" }}
                >
                  {micActive ? "Mic on" : "Mic off"}
                </button>
                <button
                  onClick={() => void speak("You're doing great. I'm here with you.")}
                  style={{ padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, border: "none", cursor: "pointer", backdropFilter: "blur(6px)" }}
                >
                  Reassure me
                </button>
                <button
                  onClick={() => void stopSession()}
                  style={{ padding: "8px 16px", borderRadius: 999, background: "rgba(232,115,90,0.85)", color: "#fff", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}
                >
                  End
                </button>
              </div>
            </div>
          )}
        </div>

        {status === "connected" && sessionId && (
          <div style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
            Session · {sessionId.slice(0, 8)}...
          </div>
        )}
      </div>

      <div className="companion-footer">
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
          Say &apos;Help me&apos; anytime to trigger emergency
        </p>
        <Link to="/emergency" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ color: "#E8735A" }}>Emergency</button>
        </Link>
      </div>
    </PhoneFrame>
  );
}
