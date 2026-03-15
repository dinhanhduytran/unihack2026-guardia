import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setDestination,
  setOrigin,
  type SavedLocation,
} from "../../store/locationSlice";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

type Props = {
  kind: "origin" | "destination";
  placeholder: string;
  className: string;
  iconLeft?: string;
  iconRight?: string;
  onLocationSelected?: (location: SavedLocation) => void;
  commitToStore?: boolean;
};

// iconLeft / iconRight props are kept for API compatibility but SVG icons are always rendered

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const MELBOURNE_PROXIMITY = "144.9631,-37.8136";
const MAPBOX_API_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const MAPBOX_RESULT_LIMIT = 6;

type MapboxFeature = {
  id: string;
  place_name: string;
  center?: [number, number];
};

type MapboxForwardResponse = {
  features?: MapboxFeature[];
};

export default function PlaceSearchInput({
  kind,
  placeholder,
  className,
  iconLeft: _iconLeft = "📍",
  iconRight: _iconRight = "🔍",
  onLocationSelected,
  commitToStore = true,
}: Props) {
  const dispatch = useAppDispatch();
  const origin = useAppSelector((state) => state.location.origin);
  const destination = useAppSelector((state) => state.location.destination);
  const selected = commitToStore ? (kind === "origin" ? origin : destination) : null;
  const [value, setValue] = useState(selected?.address ?? "");
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";
  const hasToken = mapboxToken.trim().length > 0;

  useEffect(() => {
    setValue(selected?.address ?? "");
  }, [selected?.address]);

  useEffect(() => {
    const query = value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (!hasToken) {
      setResults([]);
      setLoading(false);
      setError("Map search unavailable.");
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          setLoading(true);
          setError(null);

          const endpoint = `${MAPBOX_API_BASE}/${encodeURIComponent(query)}.json`;
          const response = await fetch(
            `${endpoint}?access_token=${encodeURIComponent(mapboxToken)}&autocomplete=true&country=au&proximity=${encodeURIComponent(MELBOURNE_PROXIMITY)}&limit=${MAPBOX_RESULT_LIMIT}`,
            { signal: controller.signal },
          );

          if (!response.ok) {
            throw new Error(`Mapbox geocode failed: ${response.status}`);
          }

          const payload = (await response.json()) as MapboxForwardResponse;
          setResults(payload.features ?? []);
        } catch (fetchError) {
          if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
            return;
          }
          setResults([]);
          setError("Unable to fetch places right now.");
        } finally {
          setLoading(false);
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [hasToken, mapboxToken, value]);

  const suggestions = useMemo(
    () =>
      results.map((item) => ({
        address: item.place_name,
        lat: item.center?.[1] ?? null,
        long: item.center?.[0] ?? null,
        placeId: item.id,
      })),
    [results],
  );
  const queryLength = value.trim().length;
  const shouldShowNoResults =
    hasToken && queryLength >= MIN_QUERY_LENGTH && !loading && !error && suggestions.length === 0;
  const showDropdown =
    isFocused &&
    queryLength >= MIN_QUERY_LENGTH &&
    (loading || error != null || suggestions.length > 0 || shouldShowNoResults);

  const saveLocation = (location: SavedLocation | null) => {
    if (!commitToStore) return;
    if (kind === "origin") {
      dispatch(setOrigin(location));
      return;
    }
    dispatch(setDestination(location));
  };

  const handleSelect = (suggestion: (typeof suggestions)[number]) => {
    setValue(suggestion.address);
    setResults([]);
    setError(null);

    const nextLocation: SavedLocation = {
      address: suggestion.address,
      lat: suggestion.lat,
      long: suggestion.long,
      placeId: suggestion.placeId,
    };
    saveLocation(nextLocation);
    onLocationSelected?.(nextLocation);
  };

  const saveManualInput = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      saveLocation(null);
      return;
    }

    saveLocation({
      address: trimmed,
      lat: selected?.lat ?? null,
      long: selected?.long ?? null,
      placeId: selected?.placeId ?? null,
    });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextValue: SavedLocation = {
          address: "Current location",
          lat: position.coords.latitude,
          long: position.coords.longitude,
          placeId: null,
        };
        saveLocation(nextValue);
        setValue(nextValue.address);
        setResults([]);
        setError(null);
      },
      () => {
        // no-op: user may deny permission
      },
    );
  };

  return (
    <div className="places-wrap">
      <div className={className}>
        <span style={{ color: "var(--coral)", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <PinIcon />
        </span>
        <input
          className="places-input"
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            saveManualInput();
          }}
        />
        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <SearchIcon />
        </span>
      </div>
      {kind === "origin" ? (
        <button className="use-current-btn" onClick={useCurrentLocation} type="button">
          Use current location
        </button>
      ) : null}
      {showDropdown ? (
        <div className="places-dropdown">
          {loading ? <div className="places-option places-option-status">Searching...</div> : null}
          {!loading && error ? (
            <div className="places-option places-option-status">{error}</div>
          ) : null}
          {!loading && !error && shouldShowNoResults ? (
            <div className="places-option places-option-status">No places found.</div>
          ) : null}
          {suggestions.map((item) => (
            <button
              key={item.placeId}
              className="places-option"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(item)}
            >
              {item.address}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
