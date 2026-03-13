import { useState } from "react";
import PhoneFrame from "../components/layout/PhoneFrame";

export default function Profile() {
  const [emergencyNumber, setEmergencyNumber] = useState("+61 400 000 000");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    console.log("[Profile] Emergency number updated:", emergencyNumber);
  };

  return (
    <PhoneFrame withNav>
      <div className="profile-screen">
        <div className="profile-card">
          <h1 className="profile-title">Profile</h1>
          <p className="profile-subtitle">Update your emergency contact number.</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Emergency Number</label>
              <input
                className="input-field"
                type="tel"
                value={emergencyNumber}
                onChange={(event) => {
                  setEmergencyNumber(event.target.value);
                  if (saved) setSaved(false);
                }}
                placeholder="+61 400 000 000"
              />
            </div>
            <button className="btn-primary" type="submit">
              Save Number
            </button>
          </form>

          {saved ? <p className="profile-success">Emergency number saved.</p> : null}
        </div>
      </div>
    </PhoneFrame>
  );
}
