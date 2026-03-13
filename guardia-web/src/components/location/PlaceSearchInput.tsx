import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setDestination,
  setOrigin,
  type SavedLocation,
} from "../../store/locationSlice";

type Props = {
  kind: "origin" | "destination";
  placeholder: string;
  className: string;
  iconLeft?: string;
  iconRight?: string;
  onLocationSelected?: (location: SavedLocation) => void;
};

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
  iconLeft = "📍",
  iconRight = "🔍",
  onLocationSelected,
}: Props) {
  const dispatch = useAppDispatch();
  const origin = useAppSelector((state) => state.location.origin);
  const destination = useAppSelector((state) => state.location.destination);
  const selected = kind === "origin" ? origin : destination;
  const [value, setValue] = useState(selected?.address ?? "");
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    queryLength >= MIN_QUERY_LENGTH &&
    (loading || error != null || suggestions.length > 0 || shouldShowNoResults);

  const saveLocation = (location: SavedLocation | null) => {
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
        <span style={{ fontSize: 16 }}>{iconLeft}</span>
        <input
          className="places-input"
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onBlur={saveManualInput}
        />
        <span style={{ fontSize: 16, color: "var(--text-muted)" }}>{iconRight}</span>
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
