import math
import os
import httpx
from fastapi import FastAPI, Query, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from emergency_voice_detect import build_voice_detect_response


from route_searching import (
    create_index,
    load_csv_to_elasticsearch,
    get_mapbox_routes,
    find_events_on_route,
    SEVERITY_WEIGHT,
    rank_routes
)
load_dotenv()
HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
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
SAVE_DIR = "./audio"
os.makedirs(SAVE_DIR, exist_ok=True)  

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
    scored = rank_routes(mapbox_routes, radius="150m", recent_days=90)
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
                "id": e["event_id"],
                "lat": 0,
                "lng": 0,
                "type": e["type"],
                "date": e["date"],
            }
            for e in route.get("route_events", [])
        ]
        results.append({
            "distance": route["distance_km"] * 1000,
            "duration": route["eta_minutes"] * 60,
            "safety_score": route["safety_score"],
            "points": points,
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


# @app.post("/voice_detect")
# async def voice_detect(audio: UploadFile = File(...)):
#     if not audio:
#         raise HTTPException(status_code=400, detail="Audio file is missing")

#     print(f"[voice_detect] Audio file: {audio.filename}")
#     if not OPENAI_API_KEY:
#         raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")

#     # Read audio into memory
#     audio_bytes = await audio.read()
#     if not audio_bytes:
#         raise HTTPException(status_code=400, detail="Audio file is empty")

#     # Determine save filename: use extension from original or default to webm
#     filename = audio.filename or "chunk.webm"
#     save_path = os.path.join(SAVE_DIR, filename)

#     # Save uploaded audio locally
#     with open(save_path, "wb") as f:
#         f.write(audio_bytes)
#     print(f"[voice_detect] Saved audio to {save_path}")

#     # Send to OpenAI Whisper API
#     async with httpx.AsyncClient(timeout=60) as client:
#         response = await client.post(
#             "https://api.openai.com/v1/audio/transcriptions",
#             headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
#             data={"model": "whisper-1"},
#             files={
#                 "file": (
#                     filename,
#                     audio_bytes,
#                     audio.content_type or "audio/wav",  # use proper MIME type
#                 )
#             },
#         )

#     if response.status_code != 200:
#         print(f"[voice_detect] OpenAI error {response.status_code}: {response.text}")
#         raise HTTPException(status_code=response.status_code, detail=response.text)

#     transcript = response.json().get("text", "")
#     print(f"[voice_detect] Transcript: {transcript}")

#     # Return your custom response
#     return build_voice_detect_response(transcript)