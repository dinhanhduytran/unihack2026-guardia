import PhoneFrame from "../components/layout/PhoneFrame";

export default function S8Emergency() {
  return (
    <PhoneFrame>
      <div className="emergency-bg">
        <div className="emer-card">
          <div className="emer-icon-wrap"><span className="emer-icon">🚨</span></div>
          <div className="emer-title">Emergency Alert</div>
          <div className="emer-msg">You&apos;ve been off-route for 3 minutes.</div>
          <div className="emer-sub">Calling 000 automatically in</div>
          <div className="countdown-wrap">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="var(--coral-pale)" strokeWidth="7" />
              <circle cx="48" cy="48" r="40" fill="none" stroke="var(--coral)" strokeWidth="7" strokeLinecap="round" strokeDasharray="251.3" strokeDashoffset="50" transform="rotate(-90 48 48)" />
            </svg>
            <div className="countdown-num">8</div>
          </div>
          <ul className="checklist">
            <li><div className="ci ci-done">✓</div> Location sent to Mum, Alex</li>
            <li><div className="ci ci-done">✓</div> Audio recording started</li>
            <li><div className="ci ci-spin">↻</div> <span style={{ color: "var(--amber)" }}>Connecting to 000...</span></li>
          </ul>
          <div className="emer-btns">
            <button className="btn-ghost-teal" style={{ height: 48, fontSize: 14, borderRadius: 12 }}>I&apos;m Safe</button>
            <button className="btn-primary" style={{ height: 48, fontSize: 14, borderRadius: 12, background: "linear-gradient(135deg,#E8735A,#c0392b)" }}>📞 Call Now</button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
