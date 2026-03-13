import { Link } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";

export default function S0Welcome() {
  return (
    <PhoneFrame>
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

      <div className="s0-body">
        <div className="s0-greeting">
          <span className="s0-wave">👋</span>
          <p className="s0-greeting-title">
            Hello,
            <br />
            Welcome back!
          </p>
          <p className="s0-greeting-sub">Your safety companion is ready to guide you home.</p>
        </div>

        <div className="s0-hero">
          <div className="s0-logo-orb">🛡️</div>
          <p className="s0-app-name">
            Safe <span>Router</span>
          </p>
          <p className="s0-tagline">Navigate with confidence</p>
        </div>

        <div className="s0-bottom">
          <div className="s0-pills">
            <div className="s0-pill">
              <span className="s0-pill-dot s0-dot-teal" />
              Smart routes
            </div>
            <div className="s0-pill">
              <span className="s0-pill-dot s0-dot-coral" />
              Live safety
            </div>
            <div className="s0-pill">
              <span className="s0-pill-dot s0-dot-amber" />
              SOS alerts
            </div>
          </div>

          <Link to="/onboarding">
            <button className="btn-primary">Get Started →</button>
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
