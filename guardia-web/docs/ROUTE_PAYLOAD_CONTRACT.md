# Route Payload Contract (Frontend <-> Backend)

## Can Mapbox handle this response?

Yes. Mapbox can render this format easily as long as `routes` (or `points`) is an ordered list of coordinates.

- You can keep a horizontal list of 3 route cards.
- When user taps a card, set it as selected route.
- Mapbox updates highlighted polyline for selected route.

## Naming normalization (recommended)

Your sample has minor typos/inconsistencies:

- `original` -> should be `origin`
- `desination` -> should be `destination`
- `longtitude` -> should be `longitude` (or `long` if your app standard is `long`)

Recommended request body:

```json
{
  "origin": {
    "address": "22 Hook Street",
    "latitude": -37.8083,
    "longitude": 144.9632
  },
  "destination": {
    "address": "80 Graham Street",
    "latitude": -37.8045,
    "longitude": 144.9655
  }
}
```

If you must keep current backend keys, frontend can map before send:

```json
{
  "original": {
    "address": "22 Hook Street",
    "latitude": -37.8083,
    "longtitude": 144.9632
  },
  "desination": {
    "address": "80 Graham Street",
    "latitude": -37.8045,
    "longtitude": 144.9655
  }
}
```

## Backend response contract

Your response shape is valid for route cards + map rendering:

```json
[
  {
    "id": "route_1",
    "label": "Via Collins St",
    "distance_km": 1.1,
    "eta_minutes": 14,
    "safety_score": 87,
    "total_risk": 2.15,
    "crime_count": 2,
    "route_events": [
      {
        "type": "street_harassment",
        "risk": 0.62,
        "distance_m": 120
      }
    ],
    "recommended": true,
    "routes": [
      [144.9632, -37.8083],
      [144.9641, -37.8071],
      [144.9652, -37.8052]
    ]
  }
]
```

Coordinate note:

- Keep `routes` as `[longitude, latitude]` for GeoJSON/Mapbox compatibility.

## Frontend TypeScript types

```ts
export type LocationPoint = {
  address: string;
  latitude: number;
  longitude: number;
};

export type RouteEvent = {
  id?: string;
  type: string;
  risk: number;
  distance_m?: number;
  latitude?: number;
  longitude?: number;
  radius_m?: number;
};

export type SafeRoute = {
  id: string;
  label: string;
  distance_km: number;
  eta_minutes: number;
  safety_score: number;
  total_risk: number;
  crime_count: number;
  route_events: RouteEvent[];
  recommended: boolean;
  routes: [number, number][]; // [lng, lat]
};

export type SafeRouteRequest = {
  origin: LocationPoint;
  destination: LocationPoint;
};
```

## Example mock response with 3 routes

```json
[
  {
    "id": "r1",
    "label": "Via Collins St",
    "distance_km": 1.1,
    "eta_minutes": 14,
    "safety_score": 87,
    "total_risk": 2.15,
    "crime_count": 2,
    "route_events": [],
    "recommended": true,
    "routes": [
      [144.9632, -37.8083],
      [144.9642, -37.8072],
      [144.9654, -37.805]
    ]
  },
  {
    "id": "r2",
    "label": "Via Flinders Ln",
    "distance_km": 0.9,
    "eta_minutes": 11,
    "safety_score": 52,
    "total_risk": 5.4,
    "crime_count": 4,
    "route_events": [],
    "recommended": false,
    "routes": [
      [144.9632, -37.8083],
      [144.9649, -37.8075],
      [144.9654, -37.805]
    ]
  },
  {
    "id": "r3",
    "label": "Via Swanston St",
    "distance_km": 1.3,
    "eta_minutes": 16,
    "safety_score": 76,
    "total_risk": 3.1,
    "crime_count": 1,
    "route_events": [],
    "recommended": false,
    "routes": [
      [144.9632, -37.8083],
      [144.9638, -37.8067],
      [144.9654, -37.805]
    ]
  }
]
```

## Horizontal route list + toggle behavior

State model:

- `routes: SafeRoute[]`
- `selectedRouteId: string | null`

Selection flow:

1. Load backend response into `routes`.
2. Set default selected route:
   - recommended route first, else first item.
3. Render horizontal cards from `routes`.
4. On card tap, set `selectedRouteId`.
5. Mapbox line source uses the selected route coordinates.

Example logic:

```ts
const selectedRoute = routes.find((r) => r.id === selectedRouteId) ?? routes[0];

const selectedRouteGeoJson = {
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: selectedRoute?.routes ?? [],
  },
  properties: {},
};
```

## Mapbox rendering notes

- Use one source/layer for selected route (bold line).
- Optionally draw non-selected routes as thin/faded lines.
- Fit camera to selected route bounds on selection change.
- Show incident markers from `route_events` if backend returns coordinates.
- If backend returns `radius_m`, generate an incident zone polygon from that radius.

## Incident radius -> zone generation

When each accident has a radius value, use this payload format:

```json
{
  "id": "evt_12",
  "type": "street_harassment",
  "latitude": -37.8076,
  "longitude": 144.9649,
  "radius_m": 110
}
```

Frontend rendering rule:

1. Use `latitude/longitude` as center point.
2. Generate a circle polygon from `radius_m` (meters).
3. Render:
   - Fill layer: soft coral tint
   - Stroke layer: coral outline
   - Center marker: incident icon
4. Optional severity class from radius:
   - `radius_m >= 140` -> high
   - `radius_m >= 90` -> medium
   - else -> low

This allows the visual incident area to grow/shrink automatically when radius changes.

## Final payload recommendation for your current app

If app store keeps `address + lat + long`, send this stable format:

```json
{
  "origin": {
    "address": "22 Hook Street",
    "latitude": -37.8083,
    "longitude": 144.9632
  },
  "destination": {
    "address": "80 Graham Street",
    "latitude": -37.8045,
    "longitude": 144.9655
  }
}
```

This gives backend both human-readable address and precise coordinates.
