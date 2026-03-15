import { Link } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";

export default function S7AICall() {
  return (
    <PhoneFrame dark>
      <div className="call-bg">
        <div className="call-header">
          <div className="call-close">✕</div>
          <div className="call-title-text">Guardia Companion</div>
          <div className="call-subtitle-text">Secure · Encrypted</div>
        </div>
        <div className="call-main">
          <div className="call-avatar">
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 2 L28 7 L28 16 C28 22.5 22.5 27.5 16 30 C9.5 27.5 4 22.5 4 16 L4 7 Z"
                fill="#FF6B6B"
              />
              <path
                d="M11 16 L14.5 19.5 L21 13"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="call-ai-name">Guardia AI</div>
          <div className="call-listening">Listening...</div>
          <div className="call-transcript">
            <p>
              &quot;I can hear you, Sarah. You&apos;re safe. Tell me what&apos;s
              happening.&quot;
            </p>
          </div>
          <div className="user-thumb">👤</div>
        </div>
        <div className="call-controls">
          <div className="call-btns">
            <div className="cbtn">🔇</div>
            <div className="cbtn">📷</div>
            <div className="cbtn">🔊</div>
            <div className="cbtn sos">🚨</div>
          </div>
          <div className="call-end">End Call</div>
          <Link
            to="/companion"
            className="call-back"
            style={{ textDecoration: "none", display: "block" }}
          >
            ← Back to map companion
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
