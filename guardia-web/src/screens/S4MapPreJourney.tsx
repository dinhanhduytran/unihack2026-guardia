import { Link } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";

export default function S4MapPreJourney() {
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
        <div className="map-road-h" style={{ top: 280, height: 6 }} />
        <div className="map-road-h map-road-major-h" style={{ top: 370 }} />
        <div className="map-road-h" style={{ top: 450, height: 5 }} />
        <div className="map-road-v" style={{ left: 72 }} />
        <div className="map-road-v map-road-major-v" style={{ left: 154 }} />
        <div className="map-road-v" style={{ left: 248, width: 6 }} />
        <div className="map-road-v map-road-major-v" style={{ left: 305 }} />
        <div className="incident-zone" style={{ width: 110, height: 110, top: 125, left: 205, transform: "translate(-50%,-50%)" }} />
        <div className="incident-zone" style={{ width: 84, height: 84, top: 345, left: 68, transform: "translate(-50%,-50%)" }} />
        <div className="user-dot" style={{ top: 296, left: 165, transform: "translate(-50%,-50%)" }} />
        <div className="map-search">
          <span style={{ fontSize: 16, color: "var(--coral)" }}>📍</span>
          <span className="ph">Where are you heading?</span>
          <span style={{ fontSize: 16, color: "var(--text-muted)" }}>⚙️</span>
        </div>
        <div className="bottom-sheet">
          <div className="drag-handle" />
          <div className="section-head">Suggested for tonight</div>
          <div className="route-scroll">
            <div className="rcard sel">
              <div className="rcard-via">Via Collins St</div>
              <div className="rcard-score" style={{ color: "var(--teal)" }}>87</div>
              <div className="rcard-meta">14 min · 1.1 km</div>
              <span className="badge badge-teal">+ Safest</span>
            </div>
            <div className="rcard">
              <div className="rcard-via">Via Flinders Ln</div>
              <div className="rcard-score" style={{ color: "var(--amber)" }}>52</div>
              <div className="rcard-meta">11 min · 0.9 km</div>
              <span className="badge badge-amber">▲ 2 incidents</span>
            </div>
          </div>
          <Link to="/journey"><button className="btn-primary">Start Journey →</button></Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
