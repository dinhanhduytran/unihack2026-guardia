import math
import os
import httpx
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


from route_searching import (
    create_index,
    load_csv_to_elasticsearch,
    get_mapbox_routes,
    find_events_on_route,
    SEVERITY_WEIGHT,
    rank_routes
)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY", "")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data once on startup
create_index()
load_csv_to_elasticsearch("./melbourne_safety.csv")


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
    scored = rank_routes(mapbox_routes, radius="150m", recent_days=None)
    results = []
    for route in scored:
        coords = route["routes"]  # [[lng, lat], ...]
        points = [
            {
                "geometry": {"coordinates": coord, "type": "Point"},
                "distance": 0,
                "duration": 0,
                "weight": route["safety_score"],
            }
            for coord in coords
        ]
        crime_events = [
            {
                "id":   e["event_id"],
                "lat":  e["lat"],
                "lng":  e["lng"],
                "type": e["type"],
                "date": e["date"],
            }
            for e in route.get("route_events", [])
        ]
        results.append({
            "distance":     route["distance_km"] * 1000,
            "duration":     route["eta_minutes"] * 60,
            "safety_score": route["safety_score"],
            "recommended":  route["recommended"],
            "points":       points,
            "crime_events": crime_events,
        })
    return results


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
