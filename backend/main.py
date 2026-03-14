import math
import os
import httpx
from datetime import datetime
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


from route_searching import (
    create_index,
    load_csv_to_elasticsearch,
    get_mapbox_routes,
    find_events_on_route,
    SEVERITY_WEIGHT,
)
load_dotenv(os.path.join(os.getcwd(), ".env"))
HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")
assert HEYGEN_API_KEY, "HEYGEN_API_KEY is not set"
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data once on startup
create_index()
load_csv_to_elasticsearch("./dummy_data.csv")


@app.get("/")
def root():
    return {"message": "Hackathon API running"}


@app.get("/routes")
def scored_routes(
    origin_lat: float = Query(...),
    origin_lng: float = Query(...),
    dest_lat: float = Query(...),
    dest_lng: float = Query(...),
):
    mapbox_routes = get_mapbox_routes(origin_lng, origin_lat, dest_lng, dest_lat)
    today = datetime.today()
    all_routes = []

    for route in mapbox_routes:
        coords = route["geometry"]["coordinates"]  # [[lng, lat], ...]
        cumulative_distance = 0.0
        cumulative_duration = 0.0
        points = []
        seen_event_ids = set()
        crime_events = []
        route_total_risk = 0.0

        for idx, (lng, lat) in enumerate(coords):
            segment_m = 0.0
            segment_min = 0.0
            if idx > 0:
                prev_lng, prev_lat = coords[idx - 1]
                R = 6371000
                phi1, phi2 = math.radians(prev_lat), math.radians(lat)
                dphi = math.radians(lat - prev_lat)
                dlambda = math.radians(lng - prev_lng)
                a = (
                    math.sin(dphi / 2) ** 2
                    + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
                )
                segment_m = 2 * R * math.asin(math.sqrt(a))
                segment_min = (segment_m / route["distance"]) * (route["duration"] / 60)
                cumulative_distance += segment_m
                cumulative_duration += segment_min

            events = find_events_on_route(lat, lng, radius="150m", recent_days=90)
            point_risk = 0.0
            for event in events:
                days_ago = (today - datetime.strptime(event["date"], "%Y-%m-%d")).days
                decay = 1 / (1 + days_ago / 90)
                weighted = SEVERITY_WEIGHT.get(event["type"], 0) * decay
                point_risk += weighted
                if event["id"] not in seen_event_ids:
                    seen_event_ids.add(event["id"])
                    route_total_risk += weighted
                    crime_events.append({
                        "id": event["id"],
                        "lat": event["lat"],
                        "lng": event["lng"],
                        "type": event["type"],
                        "date": event["date"],
                    })

            points.append({
                "geometry": {"coordinates": [lng, lat], "type": "Point"},
                "distance": round(segment_m, 2),
                "duration": round(segment_min, 2),
                "weight": max(0, round(100 - point_risk * 2)),
            })

        safety_score = max(0, round(100 - route_total_risk * 2))

        all_routes.append({
            "distance": route["distance"],
            "duration": route["duration"],
            "safety_score": safety_score,
            "points": points,
            "crime_events": crime_events,
        })

    return all_routes


@app.post("/companion/start")
async def companion_start():
    if not HEYGEN_API_KEY:
        raise HTTPException(status_code=500, detail="HEYGEN_API_KEY not set")

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.heygen.com/v1/streaming.create_token",
            headers={"X-Api-Key": HEYGEN_API_KEY},
            timeout=30,
        )
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    token = res.json().get("data", {}).get("token")
    return {"token": token}
