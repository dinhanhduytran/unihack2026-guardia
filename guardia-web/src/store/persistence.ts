export type StoredPermissionStatus = "idle" | "granted" | "denied" | "unsupported";
export type PermissionKind = "location" | "mic";
import type { RecentRoute } from "./locationSlice";

const STORAGE_KEYS = {
  userName: "guardia.userName",
  emergencyContactName: "guardia.emergencyContactName",
  emergencyContactPhone: "guardia.emergencyContactPhone",
  recentRoutes: "guardia.recentRoutes",
  locationPermission: "guardia.permission.location",
  micPermission: "guardia.permission.mic",
} as const;

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export const readStoredProfile = () => {
  const storage = getStorage();
  return {
    userName: storage?.getItem(STORAGE_KEYS.userName) ?? "",
    emergencyContactName: storage?.getItem(STORAGE_KEYS.emergencyContactName) ?? "",
    emergencyContactPhone: storage?.getItem(STORAGE_KEYS.emergencyContactPhone) ?? "",
  };
};

export const saveOnboardingProfile = (profile: {
  userName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEYS.userName, profile.userName);
  storage.setItem(STORAGE_KEYS.emergencyContactName, profile.emergencyContactName);
  storage.setItem(STORAGE_KEYS.emergencyContactPhone, profile.emergencyContactPhone);
};

export const saveEmergencyContact = (contact: {
  emergencyContactName: string;
  emergencyContactPhone: string;
}) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEYS.emergencyContactName, contact.emergencyContactName);
  storage.setItem(STORAGE_KEYS.emergencyContactPhone, contact.emergencyContactPhone);
};

export const readRecentRoutes = (): RecentRoute[] => {
  const storage = getStorage();
  const raw = storage?.getItem(STORAGE_KEYS.recentRoutes);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as RecentRoute[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveRecentRoutes = (recentRoutes: RecentRoute[]) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEYS.recentRoutes, JSON.stringify(recentRoutes));
};

export const readPermissionStatus = (kind: PermissionKind): StoredPermissionStatus => {
  const storage = getStorage();
  const key = kind === "location" ? STORAGE_KEYS.locationPermission : STORAGE_KEYS.micPermission;
  const value = storage?.getItem(key);
  if (value === "granted" || value === "denied" || value === "unsupported" || value === "idle") {
    return value;
  }
  return "idle";
};

export const savePermissionStatus = (kind: PermissionKind, status: StoredPermissionStatus) => {
  const storage = getStorage();
  if (!storage) return;
  const key = kind === "location" ? STORAGE_KEYS.locationPermission : STORAGE_KEYS.micPermission;
  storage.setItem(key, status);
};

export const hasCompletedSetupFromStorage = () => {
  const { userName, emergencyContactName, emergencyContactPhone } = readStoredProfile();
  const hasProfileValues =
    userName.trim() !== "" && emergencyContactName.trim() !== "" && emergencyContactPhone.trim() !== "";
  const hasLocation = readPermissionStatus("location") === "granted";
  const hasMic = readPermissionStatus("mic") === "granted";
  return hasProfileValues && hasLocation && hasMic;
};
