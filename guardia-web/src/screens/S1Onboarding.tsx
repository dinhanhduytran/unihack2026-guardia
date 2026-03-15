import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";
import { useAppDispatch } from "../store/hooks";
import { setOnboardingProfile } from "../store/profileSlice";
import { saveOnboardingProfile } from "../store/persistence";

export default function S1Onboarding() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const sanitizePhone = (value: string) => value.replace(/\D/g, "");
  const userNameError = userName.trim() === "";
  const emergencyContactNameError = emergencyContactName.trim() === "";
  const emergencyContactPhoneError = emergencyContactPhone.trim() === "";
  const hasAnyError =
    userNameError || emergencyContactNameError || emergencyContactPhoneError;

  const handleContinue = () => {
    setAttemptedSubmit(true);
    if (hasAnyError) return;

    dispatch(
      setOnboardingProfile({
        userName: userName.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
      }),
    );
    saveOnboardingProfile({
      userName: userName.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
    });
    navigate("/permissions");
  };

  return (
    <PhoneFrame>
      <div className="s1-hero">
        <div className="orb">
          <svg
            className="orb-icon"
            width="56"
            height="62"
            viewBox="0 0 56 62"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M28 2L4 12v20c0 15 11 28.5 24 31C41 59.5 52 46 52 32V12L28 2Z"
              fill="url(#shieldGrad1)"
            />
            <path
              d="M28 41s-13-8-13-16a9 9 0 0 1 13-8 9 9 0 0 1 13 8c0 8-13 16-13 16Z"
              fill="white"
              opacity="0.88"
            />
            <defs>
              <linearGradient
                id="shieldGrad1"
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
        </div>
        <div className="s1-brand">guardia</div>
        <div className="s1-tagline">Walk home fearlessly.</div>
        <div
          className="s1-tagline"
          style={{ color: "var(--text-muted)", fontSize: 13 }}
        >
          Your safety companion
        </div>
      </div>
      <div className="s1-sheet">
        <h2>Let&apos;s get you set up</h2>
        <p className="sub">Takes 30 seconds.</p>
        <div className="input-group">
          <label className="input-label">Your name</label>
          <input
            className="input-field"
            type="text"
            placeholder="Sarah"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
          />
          {attemptedSubmit && userNameError ? (
            <p style={{ marginTop: 4, fontSize: 11, color: "#D22F2F" }}>
              Please fill in your name.
            </p>
          ) : null}
        </div>
        <div className="input-group">
          <label className="input-label">Emergency contact name</label>
          <input
            className="input-field"
            type="text"
            placeholder="Mum"
            value={emergencyContactName}
            onChange={(event) => setEmergencyContactName(event.target.value)}
          />
          {attemptedSubmit && emergencyContactNameError ? (
            <p style={{ marginTop: 4, fontSize: 11, color: "#D22F2F" }}>
              Please fill in emergency contact name.
            </p>
          ) : null}
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label className="input-label">Emergency contact phone</label>
          <input
            className="input-field"
            type="text"
            placeholder="+61 400 000 000"
            value={emergencyContactPhone}
            onChange={(event) =>
              setEmergencyContactPhone(sanitizePhone(event.target.value))
            }
          />
          {attemptedSubmit && emergencyContactPhoneError ? (
            <p style={{ marginTop: 4, fontSize: 11, color: "#D22F2F" }}>
              Please fill in emergency contact phone.
            </p>
          ) : null}
        </div>
        <button className="btn-primary" onClick={handleContinue}>
          Continue →
        </button>
        {attemptedSubmit && hasAnyError ? (
          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "#D22F2F",
              marginTop: 8,
            }}
          >
            Some boxes are not filled. Please complete all fields.
          </p>
        ) : null}
        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 10,
          }}
        >
          Your data stays private. Never shared.
        </p>
      </div>
    </PhoneFrame>
  );
}
