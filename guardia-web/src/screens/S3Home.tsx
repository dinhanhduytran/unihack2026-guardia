import PhoneFrame from "../components/layout/PhoneFrame";
import PlaceSearchInput from "../components/location/PlaceSearchInput";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useNavigate } from "react-router-dom";
import { setDestination, setSelectedRoute } from "../store/locationSlice";

export default function S3Home() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userName = useAppSelector((state) => state.profile.userName);
  const displayName = userName || "Sarah";
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "S";

  const handleHomeQuickDestination = () => {
    dispatch(
      setDestination({
        address: "Home",
        lat: -37.8103,
        long: 144.9625,
        placeId: null,
      }),
    );
    dispatch(setSelectedRoute(null));
    navigate("/map");
  };

  return (
    <PhoneFrame withNav>
      <div className="home-header">
        <div>
          <div className="greeting-small">Good evening 👋</div>
          <div className="greeting-name">{displayName}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "var(--surface)",
              boxShadow: "0 2px 10px var(--shadow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
            aria-label="Notifications"
          >
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path d="M8 0a1.3 1.3 0 0 0-1.3 1.3v.55A5.5 5.5 0 0 0 2.5 7.3v3.7L1 12.5V13h14v-.5L13.5 11V7.3A5.5 5.5 0 0 0 9.3 1.85V1.3A1.3 1.3 0 0 0 8 0z" fill="currentColor"/>
              <path d="M6.2 15a1.8 1.8 0 0 0 3.6 0H6.2z" fill="currentColor"/>
            </svg>
          </button>
          <div className="avatar-lg">{avatarInitial}</div>
        </div>
      </div>
      <PlaceSearchInput
        kind="destination"
        placeholder="Where are you heading?"
        className="search-bar"
        onLocationSelected={(location) => {
          if (location.lat != null && location.long != null) {
            navigate("/map");
          }
        }}
      />
      <div className="home-scroll">
        <div className="section-head">Quick destinations</div>
        <div className="chips-row">
          <button
            type="button"
            className="chip active"
            onClick={handleHomeQuickDestination}
            style={{ border: "none", cursor: "pointer" }}
          >
            🏠 Home
          </button>
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
