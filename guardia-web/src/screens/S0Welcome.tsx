import { Link } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";

function ShieldHeartIcon() {
  return (
    <svg
      width="56"
      height="62"
      viewBox="0 0 56 62"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M28 2L4 12v20c0 15 11 28.5 24 31C41 59.5 52 46 52 32V12L28 2Z"
        fill="url(#shieldGrad)"
      />
      <path
        d="M28 41s-13-8-13-16a9 9 0 0 1 13-8 9 9 0 0 1 13 8c0 8-13 16-13 16Z"
        fill="white"
        opacity="0.88"
      />
      <defs>
        <linearGradient
          id="shieldGrad"
          x1="4"
          y1="2"
          x2="52"
          y2="62"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF6B6B" />
          <stop offset="1" stopColor="#FF8E8E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function S0Welcome() {
  return (
    <PhoneFrame>
      <div className="s0-wrap">
        {/* Top bar */}
        <div className="s0-topbar">
          <span className="s0-brand">guardia</span>
        </div>

        {/* Hero orb */}
        <div className="s0-orb-wrap">
          <div className="s0-orb-glow" />
          <div className="s0-float-dot s0-float-dot-tl" />
          <div className="s0-float-dot s0-float-dot-br" />
          <div className="s0-orb-circle">
            <ShieldHeartIcon />
          </div>
        </div>

        {/* Tagline */}
        <div className="s0-tagline-block">
          <h1 className="s0-headline">
            Walk home
            <br />
            fearlessly.
          </h1>
          <p className="s0-desc">
            Your elegant companion for every journey.
            <br />
            Trusted, safe, and always by your side.
          </p>
        </div>

        {/* CTA */}
        <div className="s0-cta-wrap">
          <Link to="/onboarding" style={{ display: "block" }}>
            <button className="btn-primary">Get Started</button>
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
