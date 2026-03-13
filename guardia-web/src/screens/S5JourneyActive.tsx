import PhoneFrame from "../components/layout/PhoneFrame";

export default function S5JourneyActive() {
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
      <div className="map-wrap">
        <div className="map-road-h map-road-major-h" style={{ top: 170 }} />
        <div className="map-road-h" style={{ top: 310, height: 6 }} />
        <div className="map-road-v map-road-major-v" style={{ left: 154 }} />
        <div className="map-road-v" style={{ left: 270, width: 6 }} />
        <svg className="route-line-svg" width="390" height="100%" viewBox="0 0 390 700" preserveAspectRatio="none">
          <path d="M161 80 L161 310 L270 310" fill="none" stroke="#3AAFA9" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 4" opacity="0.85" />
          <circle cx="161" cy="80" r="6" fill="#3AAFA9" opacity="0.5" />
          <circle cx="270" cy="310" r="7" fill="#3AAFA9" opacity="0.7" />
        </svg>
        <div className="journey-dot" style={{ top: 210, left: 155, transform: "translate(-50%,-50%)" }} />
        <div className="hud-row">
          <div className="hud-card">
            <div className="hud-lbl">ETA</div>
            <div className="hud-val">8 min</div>
            <div className="hud-sub">0.6 km left</div>
          </div>
          <div className="hud-card">
            <div className="hud-lbl">Safety</div>
            <div className="hud-val" style={{ color: "var(--teal)" }}>87</div>
            <div className="hud-sub" style={{ color: "var(--teal)", display: "flex", alignItems: "center", gap: 4 }}>
              <span className="dot-status dot-green" /> Safe zone
            </div>
          </div>
        </div>
        <div className="bottom-sheet">
          <div className="drag-handle" />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="dot-status dot-green" style={{ animation: "blink 1.6s ease infinite", background: "#3CB371" }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>On safe route</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>Via Collins St — well-lit path</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Watching:</span>
            <div className="avatar-sm" style={{ background: "var(--coral)" }}>M</div>
            <div className="avatar-sm" style={{ background: "var(--teal)", marginLeft: -8 }}>A</div>
            <div className="avatar-sm" style={{ background: "var(--text-muted)", marginLeft: -8 }}>+1</div>
          </div>
          <div className="journey-actions">
            <button className="btn-ghost-teal" style={{ height: 48, fontSize: 13, borderRadius: 12 }}>✅ I&apos;m Home Safe</button>
            <button className="btn-primary" style={{ height: 48, fontSize: 13, borderRadius: 12, background: "linear-gradient(135deg,#E8735A,#c0392b)" }}>🚨 SOS</button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
