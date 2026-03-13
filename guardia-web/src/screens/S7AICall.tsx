import { Link } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";

export default function S7AICall() {
  return (
    <PhoneFrame dark>
      <div className="call-status-bar">
        <span className="status-time" style={{ color: "rgba(255,255,255,0.8)" }}>9:41</span>
        <div className="status-icons">
          <div className="signal-bars">
            <span style={{ background: "rgba(255,255,255,0.6)" }} />
            <span style={{ background: "rgba(255,255,255,0.6)" }} />
            <span style={{ background: "rgba(255,255,255,0.6)" }} />
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>▲</span>
          <div className="battery" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
            <div className="battery-fill" style={{ background: "rgba(255,255,255,0.6)" }} />
          </div>
        </div>
      </div>
      <div className="call-bg">
        <div className="call-header">
          <div className="call-close">✕</div>
          <div className="call-title-text">Guardia Companion</div>
          <div className="call-subtitle-text">Secure · Encrypted</div>
        </div>
        <div className="call-main">
          <div className="call-avatar">🛡️</div>
          <div className="call-ai-name">Guardia AI</div>
          <div className="call-listening">Listening...</div>
          <div className="call-transcript">
            <p>&quot;I can hear you, Sarah. You&apos;re safe. Tell me what&apos;s happening.&quot;</p>
          </div>
          <div className="user-thumb">👤</div>
        </div>
        <div className="call-controls">
          <div className="call-btns">
            <div className="cbtn">🔇</div>
            <div className="cbtn">📷</div>
            <div className="cbtn">🔊</div>
            <div className="cbtn sos">🚨</div>
          </div>
          <div className="call-end">End Call</div>
          <Link to="/companion" className="call-back" style={{ textDecoration: "none", display: "block" }}>
            ← Back to map companion
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
