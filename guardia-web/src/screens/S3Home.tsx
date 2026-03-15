import { useEffect, useState } from "react";
import PhoneFrame from "../components/layout/PhoneFrame";
import PlaceSearchInput from "../components/location/PlaceSearchInput";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useNavigate } from "react-router-dom";
import type { SavedLocation } from "../store/locationSlice";
import { loadRecentRoutes, setDestination, setSelectedRoute } from "../store/locationSlice";
import {
  readFavoritePlaces,
  readRecentRoutes,
  saveFavoritePlaces,
  type FavoritePlace,
} from "../store/persistence";

const FAVORITE_ICONS = [
  { key: "home", emoji: "🏠", label: "Home" },
  { key: "school", emoji: "🎓", label: "School" },
  { key: "train", emoji: "🚇", label: "Station" },
  { key: "work", emoji: "💼", label: "Work" },
  { key: "heart", emoji: "💖", label: "Favorite" },
  { key: "gym", emoji: "🏋️", label: "Gym" },
  { key: "food", emoji: "🍜", label: "Food" },
  { key: "coffee", emoji: "☕", label: "Coffee" },
  { key: "hospital", emoji: "🏥", label: "Hospital" },
  { key: "library", emoji: "📚", label: "Library" },
  { key: "park", emoji: "🌳", label: "Park" },
  { key: "shop", emoji: "🛍️", label: "Shop" },
];

export default function S3Home() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userName = useAppSelector((state) => state.profile.userName);
  const recentRoutes = useAppSelector((state) => state.location.recentRoutes);
  const displayName = userName || "Sarah";
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "S";
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlace[]>([]);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [favoriteIconKey, setFavoriteIconKey] = useState(FAVORITE_ICONS[0].key);
  const [favoriteLocation, setFavoriteLocation] = useState<SavedLocation | null>(null);
  const [favoriteError, setFavoriteError] = useState("");
  const [favoriteSearchKey, setFavoriteSearchKey] = useState(0);

  useEffect(() => {
    if (recentRoutes.length > 0) return;
    const storedRecentRoutes = readRecentRoutes();
    if (storedRecentRoutes.length > 0) {
      dispatch(loadRecentRoutes(storedRecentRoutes));
    }
  }, [dispatch, recentRoutes.length]);

  useEffect(() => {
    setFavoritePlaces(readFavoritePlaces());
  }, []);

  const handleHomeQuickDestination = () => {
    dispatch(
      setDestination({
        address: "Home",
        lat: -37.8103,
        long: 144.9625,
        placeId: null,
      }),
    );
    dispatch(setSelectedRoute(null));
    navigate("/map");
  };

  const handleRecentRoutePress = (lat: number | null, long: number | null, address: string) => {
    if (lat == null || long == null) return;
    dispatch(
      setDestination({
        address,
        lat,
        long,
        placeId: null,
      }),
    );
    dispatch(setSelectedRoute(null));
    navigate("/map");
  };

  const handleFavoriteChipPress = (favorite: FavoritePlace) => {
    dispatch(
      setDestination({
        address: favorite.address,
        lat: favorite.lat,
        long: favorite.long,
        placeId: favorite.placeId ?? null,
      }),
    );
    dispatch(setSelectedRoute(null));
    navigate("/map");
  };

  const openFavoriteModal = () => {
    setShowFavoriteModal(true);
    setFavoriteName("");
    setFavoriteIconKey(FAVORITE_ICONS[0].key);
    setFavoriteLocation(null);
    setFavoriteError("");
    setFavoriteSearchKey((prev) => prev + 1);
  };

  const handleSaveFavorite = () => {
    const trimmedName = favoriteName.trim();
    if (!trimmedName) {
      setFavoriteError("Please enter a place name.");
      return;
    }
    if (favoriteLocation?.lat == null || favoriteLocation.long == null) {
      setFavoriteError("Please choose a location from search suggestions.");
      return;
    }

    const newFavorite: FavoritePlace = {
      id: `fav-${Date.now()}`,
      name: trimmedName,
      iconKey: favoriteIconKey,
      address: favoriteLocation.address,
      lat: favoriteLocation.lat,
      long: favoriteLocation.long,
      placeId: favoriteLocation.placeId ?? null,
      createdAt: new Date().toISOString(),
    };

    const nextFavoritePlaces = [newFavorite, ...favoritePlaces.filter((fav) => fav.name !== trimmedName)].slice(0, 10);
    setFavoritePlaces(nextFavoritePlaces);
    saveFavoritePlaces(nextFavoritePlaces);
    setShowFavoriteModal(false);
  };

  return (
    <PhoneFrame withNav>
      <div className="home-header">
        <div>
          <div className="greeting-small">Good evening 👋</div>
          <div className="greeting-name">{displayName}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "var(--surface)",
              boxShadow: "0 2px 10px var(--shadow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
            aria-label="Notifications"
          >
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path d="M8 0a1.3 1.3 0 0 0-1.3 1.3v.55A5.5 5.5 0 0 0 2.5 7.3v3.7L1 12.5V13h14v-.5L13.5 11V7.3A5.5 5.5 0 0 0 9.3 1.85V1.3A1.3 1.3 0 0 0 8 0z" fill="currentColor"/>
              <path d="M6.2 15a1.8 1.8 0 0 0 3.6 0H6.2z" fill="currentColor"/>
            </svg>
          </button>
          <div className="avatar-lg">{avatarInitial}</div>
        </div>
      </div>
      <PlaceSearchInput
        kind="destination"
        placeholder="Where are you heading?"
        className="search-bar"
        onLocationSelected={(location) => {
          if (location.lat != null && location.long != null) {
            navigate("/map");
          }
        }}
      />
      <div className="home-scroll">
        <div className="section-head">Quick destinations</div>
        <div className="chips-row">
          <button
            type="button"
            className="chip active"
            onClick={handleHomeQuickDestination}
            style={{ border: "none", cursor: "pointer" }}
          >
            🏠 Home
          </button>
          {favoritePlaces.map((favorite) => {
            const icon = FAVORITE_ICONS.find((item) => item.key === favorite.iconKey)?.emoji ?? "📍";
            return (
              <button
                key={favorite.id}
                type="button"
                className="chip"
                style={{ border: "none", cursor: "pointer" }}
                onClick={() => handleFavoriteChipPress(favorite)}
              >
                {icon} {favorite.name}
              </button>
            );
          })}
          <button
            type="button"
            className="chip"
            style={{ border: "none", cursor: "pointer" }}
            onClick={openFavoriteModal}
          >
            ➕ Add
          </button>
        </div>
        <div className="section-head">Recent routes</div>
        {recentRoutes.length === 0 ? (
          <div className="route-card">
            <div className="route-icon">🕘</div>
            <div className="route-info">
              <div className="route-name">No recent routes yet</div>
              <div className="route-meta">Complete a journey to see it here</div>
            </div>
          </div>
        ) : (
          recentRoutes.map((route) => {
            const scoreClass =
              route.safety_score == null
                ? "score-hi"
                : route.safety_score >= 70
                  ? "score-hi"
                  : "score-med";
            const routeMeta =
              route.distance_km != null && route.eta_minutes != null
                ? `${route.distance_km} km · ${route.eta_minutes} min`
                : new Date(route.completedAt).toLocaleString();

            return (
              <button
                key={route.id}
                type="button"
                className="route-card"
                onClick={() =>
                  handleRecentRoutePress(
                    route.destination.lat,
                    route.destination.long,
                    route.destination.address,
                  )
                }
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div className="route-icon">🧭</div>
                <div className="route-info">
                  <div className="route-name">{route.destination.address}</div>
                  <div className="route-meta">{routeMeta}</div>
                </div>
                {route.safety_score != null ? (
                  <span className={`score ${scoreClass}`}>{route.safety_score}</span>
                ) : null}
              </button>
            );
          })
        )}
        <div className="section-head" style={{ marginTop: 10 }}>Nearby alerts</div>
        <div className="alert-card">
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              2 incidents reported within 200m
            </div>
            <div className="alert-link">View on map →</div>
          </div>
        </div>
      </div>
      {showFavoriteModal ? (
        <div className="favorite-modal-backdrop" role="dialog" aria-modal="true">
          <div className="favorite-modal-card">
            <div className="favorite-modal-title">Add favorite place</div>

            <div className="input-group">
              <label className="input-label">Location</label>
              <PlaceSearchInput
                key={favoriteSearchKey}
                kind="destination"
                placeholder="Search favorite place"
                className="search-bar"
                commitToStore={false}
                onLocationSelected={(location) => {
                  setFavoriteLocation(location);
                  if (favoriteError) setFavoriteError("");
                }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Name</label>
              <input
                className="input-field"
                type="text"
                value={favoriteName}
                onChange={(event) => {
                  setFavoriteName(event.target.value);
                  if (favoriteError) setFavoriteError("");
                }}
                placeholder="Gym"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Icon</label>
              <div
                className="chips-row"
                style={{ flexWrap: "wrap", overflowX: "visible", marginBottom: 0 }}
              >
                {FAVORITE_ICONS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`chip ${favoriteIconKey === item.key ? "active" : ""}`}
                    aria-label={item.label}
                    title={item.label}
                    style={{
                      border: "none",
                      cursor: "pointer",
                      width: 42,
                      minWidth: 42,
                      justifyContent: "center",
                      padding: 0,
                    }}
                    onClick={() => setFavoriteIconKey(item.key)}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>

            {favoriteLocation?.address ? (
              <p className="profile-subtitle" style={{ marginTop: 0, marginBottom: 8 }}>
                Selected: {favoriteLocation.address}
              </p>
            ) : null}

            {favoriteError ? (
              <p style={{ color: "#c0392b", fontSize: 12, marginTop: 0, marginBottom: 10 }}>{favoriteError}</p>
            ) : null}

            <div className="favorite-modal-actions">
              <button
                type="button"
                className="btn-ghost"
                style={{ height: 44 }}
                onClick={() => setShowFavoriteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ height: 44 }}
                onClick={handleSaveFavorite}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PhoneFrame>
  );
}
