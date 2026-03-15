import { useState } from "react";
import PhoneFrame from "../components/layout/PhoneFrame";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setOnboardingProfile } from "../store/profileSlice";
import { saveOnboardingProfile } from "../store/persistence";

export default function Profile() {
  const dispatch = useAppDispatch();
  const userNameFromStore = useAppSelector((state) => state.profile.userName);
  const emergencyContactNameFromStore = useAppSelector((state) => state.profile.emergencyContactName);
  const emergencyContactPhoneFromStore = useAppSelector((state) => state.profile.emergencyContactPhone);
  const [userName, setUserName] = useState(userNameFromStore);
  const [emergencyName, setEmergencyName] = useState(emergencyContactNameFromStore);
  const [emergencyNumber, setEmergencyNumber] = useState(emergencyContactPhoneFromStore);
  const [saved, setSaved] = useState(false);
  const sanitizePhone = (value: string) => value.replace(/\D/g, "");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(
      setOnboardingProfile({
        userName: userName.trim(),
        emergencyContactName: emergencyName.trim(),
        emergencyContactPhone: emergencyNumber.trim(),
      }),
    );
    saveOnboardingProfile({
      userName: userName.trim(),
      emergencyContactName: emergencyName.trim(),
      emergencyContactPhone: emergencyNumber.trim(),
    });
    setSaved(true);
    console.log("[Profile] Profile updated:", {
      userName,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyNumber,
    });
  };

  return (
    <PhoneFrame withNav>
      <div className="profile-screen">
        <div className="profile-card">
          <h1 className="profile-title">Profile</h1>
          <p className="profile-subtitle">Update your emergency contact details.</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Username</label>
              <input
                className="input-field"
                type="text"
                value={userName}
                onChange={(event) => {
                  setUserName(event.target.value);
                  if (saved) setSaved(false);
                }}
                placeholder="Your name"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Emergency Contact Name</label>
              <input
                className="input-field"
                type="text"
                value={emergencyName}
                onChange={(event) => {
                  setEmergencyName(event.target.value);
                  if (saved) setSaved(false);
                }}
                placeholder="Mum"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Emergency Number</label>
              <input
                className="input-field"
                type="tel"
                value={emergencyNumber}
                onChange={(event) => {
                  setEmergencyNumber(sanitizePhone(event.target.value));
                  if (saved) setSaved(false);
                }}
                placeholder="+61 400 000 000"
              />
            </div>
            <button className="btn-primary" type="submit">
              Save Profile
            </button>
          </form>

          {saved ? <p className="profile-success">Profile saved.</p> : null}
        </div>
      </div>
    </PhoneFrame>
  );
}
