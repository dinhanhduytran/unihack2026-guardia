import { Link, useLocation } from "react-router-dom";

const tabs = [
  { to: "/home", icon: "🏠", label: "Home" },
  { to: "/map", icon: "🗺️", label: "Map" },
  { to: "/companion", icon: "📞", label: "Companion" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const current = pathname === "/journey" ? "/map" : pathname;

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={`nav-tab ${current === tab.to ? "active" : ""}`}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
