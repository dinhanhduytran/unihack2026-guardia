import { Link } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";

export default function S6Companion() {
  return (
    <PhoneFrame withNav>
      <div className="status-bar">
        <span className="status-time">9:41</span>
        <div className="status-icons">
          <div className="signal-bars"><span /><span /><span /></div>
          <span className="wifi-icon">▲</span>
          <div className="battery"><div className="battery-fill" /></div>
        </div>
      </div>
      <div className="companion-body">
        <div className="companion-glow" />
        <div className="companion-avatar">🛡️</div>
        <div className="companion-name">Guardia</div>
        <div className="companion-tag">Companion</div>
        <div className="speech-bubble">
          <p>
            &quot;You&apos;re doing great, Sarah. Collins St ahead is well-lit — you&apos;re almost through
            the busy section. I&apos;m right here with you.&quot;
          </p>
        </div>
        <div className="waveform">
          <div className="wbar" /><div className="wbar" /><div className="wbar" />
          <div className="wbar" /><div className="wbar" /><div className="wbar" />
          <div className="wbar" /><div className="wbar" /><div className="wbar" />
        </div>
        <div className="status-row">
          <span className="dot-status dot-coral" />
          <span className="status-text">Listening for your voice</span>
        </div>
        <div className="status-row">
          <span className="dot-status dot-green" />
          <span className="status-text">Route active · 6 min remaining</span>
        </div>
      </div>
      <div className="companion-footer">
        <button className="btn-ghost">End Companion</button>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
          Say &apos;Help me&apos; anytime to trigger emergency
        </p>
        <Link to="/ai-call" className="muted" style={{ textDecoration: "none" }}>
          Open immersive AI call
        </Link>
      </div>
    </PhoneFrame>
  );
}
