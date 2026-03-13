import { useEffect, useMemo } from "react";
import {
  getGeocode,
  getLatLng,
  type Suggestion,
  default as usePlacesAutocomplete,
} from "use-places-autocomplete";
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
};

const GOOGLE_SCRIPT_ID = "guardia-google-maps-places-script";
type GoogleWindow = Window & { google?: { maps?: { places?: unknown } } };

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if ((window as GoogleWindow).google?.maps?.places) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve());
      }
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.body.appendChild(script);
  });
}

export default function PlaceSearchInput({
  kind,
  placeholder,
  className,
  iconLeft = "📍",
  iconRight = "🔍",
}: Props) {
  const dispatch = useAppDispatch();
  const origin = useAppSelector((state) => state.location.origin);
  const destination = useAppSelector((state) => state.location.destination);
  const selected = kind === "origin" ? origin : destination;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
  const hasApiKey = apiKey.trim().length > 0;

  const {
    ready,
    value,
    setValue,
    clearSuggestions,
    suggestions: { status, data },
    init,
  } = usePlacesAutocomplete({
    debounce: 250,
    initOnMount: false,
    requestOptions: {
      componentRestrictions: { country: "au" },
    },
  });

  useEffect(() => {
    if (selected?.address && selected.address !== value) {
      setValue(selected.address, false);
    }
  }, [selected?.address, setValue, value]);

  useEffect(() => {
    if (!hasApiKey) {
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => init())
      .catch(() => {
        // noop: UI still usable for manual typing fallback
      });
  }, [apiKey, hasApiKey, init]);

  const suggestions = useMemo(() => (status === "OK" ? data : []), [status, data]);

  const saveLocation = (location: SavedLocation | null) => {
    if (kind === "origin") {
      dispatch(setOrigin(location));
      return;
    }
    dispatch(setDestination(location));
  };

  const handleSelect = async (suggestion: Suggestion) => {
    setValue(suggestion.description, false);
    clearSuggestions();

    try {
      const geocode = await getGeocode({ placeId: suggestion.place_id });
      const result = geocode[0];
      const { lat, lng } = await getLatLng(result);

      saveLocation({
        address: suggestion.description,
        lat,
        long: lng,
        placeId: suggestion.place_id,
      });
    } catch {
      saveLocation({
        address: suggestion.description,
        lat: null,
        long: null,
        placeId: suggestion.place_id,
      });
    }
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
        setValue(nextValue.address, false);
        clearSuggestions();
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
          onChange={(event) => setValue(event.target.value)}
          onBlur={saveManualInput}
          disabled={!hasApiKey && !ready}
        />
        <span style={{ fontSize: 16, color: "var(--text-muted)" }}>{iconRight}</span>
      </div>
      {kind === "origin" ? (
        <button className="use-current-btn" onClick={useCurrentLocation} type="button">
          Use current location
        </button>
      ) : null}
      {suggestions.length > 0 ? (
        <div className="places-dropdown">
          {suggestions.map((item) => (
            <button
              key={item.place_id}
              className="places-option"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void handleSelect(item)}
            >
              {item.description}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
