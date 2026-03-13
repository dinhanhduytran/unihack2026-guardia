import { useState } from "react";
import PhoneFrame from "../components/layout/PhoneFrame";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateEmergencyContact } from "../store/profileSlice";
import { saveEmergencyContact } from "../store/persistence";

export default function Profile() {
  const dispatch = useAppDispatch();
  const emergencyContactNameFromStore = useAppSelector((state) => state.profile.emergencyContactName);
  const emergencyContactPhoneFromStore = useAppSelector((state) => state.profile.emergencyContactPhone);
  const [emergencyName, setEmergencyName] = useState(emergencyContactNameFromStore);
  const [emergencyNumber, setEmergencyNumber] = useState(emergencyContactPhoneFromStore);
  const [saved, setSaved] = useState(false);
  const sanitizePhone = (value: string) => value.replace(/\D/g, "");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(
      updateEmergencyContact({
        emergencyContactName: emergencyName.trim(),
        emergencyContactPhone: emergencyNumber.trim(),
      }),
    );
    saveEmergencyContact({
      emergencyContactName: emergencyName.trim(),
      emergencyContactPhone: emergencyNumber.trim(),
    });
    setSaved(true);
    console.log("[Profile] Emergency contact updated:", {
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
              Save Contact
            </button>
          </form>

          {saved ? <p className="profile-success">Emergency contact saved.</p> : null}
        </div>
      </div>
    </PhoneFrame>
  );
}
