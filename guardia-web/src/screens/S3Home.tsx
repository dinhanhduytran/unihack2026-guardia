import PhoneFrame from "../components/layout/PhoneFrame";
import PlaceSearchInput from "../components/location/PlaceSearchInput";
import { useAppSelector } from "../store/hooks";

export default function S3Home() {
  const origin = useAppSelector((state) => state.location.origin);
  const destination = useAppSelector((state) => state.location.destination);
  const userName = useAppSelector((state) => state.profile.userName);
  const displayName = userName || "Sarah";
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "S";

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
      <div className="home-header">
        <div>
          <div className="greeting-small">Good evening,</div>
          <div className="greeting-name">{displayName} 👋</div>
        </div>
        <div className="avatar-lg">{avatarInitial}</div>
      </div>
      <PlaceSearchInput
        kind="destination"
        placeholder="Where are you heading?"
        className="search-bar"
      />
      <div className="location-state-card">
        <div><strong>Origin:</strong> {origin?.address ?? "Not set"}</div>
        <div>{origin?.lat != null && origin?.long != null ? `${origin.lat}, ${origin.long}` : "No coordinates"}</div>
        <div style={{ marginTop: 6 }}><strong>Destination:</strong> {destination?.address ?? "Not set"}</div>
        <div>{destination?.lat != null && destination?.long != null ? `${destination.lat}, ${destination.long}` : "No coordinates"}</div>
      </div>
      <div className="home-scroll">
        <div className="section-head">Quick destinations</div>
        <div className="chips-row">
          <div className="chip active">🏠 Home</div>
          <div className="chip">🎓 RMIT</div>
          <div className="chip">🚇 Flinders St</div>
          <div className="chip">➕ Add</div>
        </div>
        <div className="section-head">Recent routes</div>
        <div className="route-card">
          <div className="route-icon">🚶</div>
          <div className="route-info">
            <div className="route-name">Home via Collins St</div>
            <div className="route-meta">1.1 km · 14 min</div>
          </div>
          <span className="score score-hi">87</span>
        </div>
        <div className="route-card">
          <div className="route-icon">🎓</div>
          <div className="route-info">
            <div className="route-name">RMIT Melbourne City</div>
            <div className="route-meta">0.9 km · 11 min</div>
          </div>
          <span className="score score-med">59</span>
        </div>
        <div className="route-card">
          <div className="route-icon">🚇</div>
          <div className="route-info">
            <div className="route-name">Flinders St Station</div>
            <div className="route-meta">1.3 km · 16 min</div>
          </div>
          <span className="score score-hi">76</span>
        </div>
        <div className="section-head" style={{ marginTop: 10 }}>Nearby alerts</div>
        <div className="alert-card">
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              2 incidents reported within 200m
            </div>
            <div className="alert-link">View on map →</div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
