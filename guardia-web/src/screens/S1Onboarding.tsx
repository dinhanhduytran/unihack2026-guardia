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
  const hasAnyError = userNameError || emergencyContactNameError || emergencyContactPhoneError;

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
          {attemptedSubmit && userNameError ? (
            <p style={{ marginTop: 4, fontSize: 11, color: "#D22F2F" }}>Please fill in your name.</p>
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
            <p style={{ marginTop: 4, fontSize: 11, color: "#D22F2F" }}>Please fill in emergency contact name.</p>
          ) : null}
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label className="input-label">Emergency contact phone</label>
          <input
            className="input-field"
            type="text"
            placeholder="+61 400 000 000"
            value={emergencyContactPhone}
            onChange={(event) => setEmergencyContactPhone(sanitizePhone(event.target.value))}
          />
          {attemptedSubmit && emergencyContactPhoneError ? (
            <p style={{ marginTop: 4, fontSize: 11, color: "#D22F2F" }}>Please fill in emergency contact phone.</p>
          ) : null}
        </div>
        <button className="btn-primary" onClick={handleContinue}>
          Continue →
        </button>
        {attemptedSubmit && hasAnyError ? (
          <p style={{ textAlign: "center", fontSize: 11, color: "#D22F2F", marginTop: 8 }}>
            Some boxes are not filled. Please complete all fields.
          </p>
        ) : null}
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
          Your data stays private. Never shared.
        </p>
      </div>
    </PhoneFrame>
  );
}
