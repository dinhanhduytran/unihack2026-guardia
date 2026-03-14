import { Link, useLocation } from "react-router-dom";

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function MapIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 4 3 6.5v13L8 17l8 3 5-2.5v-13L16 7 8 4Z" />
      <path d="M8 4v13" />
      <path d="M16 7v13" />
    </svg>
  );
}

function CompanionIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 5h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 4V8a3 3 0 0 1 3-3Z" />
      <path d="M9 10h6" />
      <path d="M9 14h4" />
    </svg>
  );
}

function ProfileIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

const tabs = [
  { to: "/home", label: "Home", Icon: HomeIcon },
  { to: "/map", label: "Map", Icon: MapIcon },
  { to: "/companion", label: "Companion", Icon: CompanionIcon },
  { to: "/profile", label: "Profile", Icon: ProfileIcon },
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
          <span className="nav-icon">
            <tab.Icon className="nav-icon-svg" />
          </span>
          <span className="nav-label">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
