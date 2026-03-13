import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/layout/PhoneFrame";
import { useAppDispatch } from "../store/hooks";
import { setOnboardingProfile } from "../store/profileSlice";

export default function S1Onboarding() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const handleContinue = () => {
    dispatch(
      setOnboardingProfile({
        userName: userName.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
      }),
    );
    navigate("/permissions");
  };

  return (
    <PhoneFrame>
      <div className="s1-hero">
        <div className="orb">
          <span className="orb-icon">🛡️</span>
        </div>
        <div className="s1-brand">guardia</div>
        <div className="s1-tagline">Walk home fearlessly.</div>
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
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label className="input-label">Emergency contact phone</label>
          <input
            className="input-field"
            type="text"
            placeholder="+61 400 000 000"
            value={emergencyContactPhone}
            onChange={(event) => setEmergencyContactPhone(event.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={handleContinue}>
          Continue →
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
          Your data stays private. Never shared.
        </p>
      </div>
    </PhoneFrame>
  );
}
