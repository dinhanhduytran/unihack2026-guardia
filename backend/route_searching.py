import math
import csv
import requests
from datetime import datetime
from elasticsearch import Elasticsearch
import os
from dotenv import load_dotenv
import json
load_dotenv()

es = Elasticsearch(
    "https://53d451333c054a5fb9e03535486d2441.us-east-2.aws.elastic-cloud.com:443",
    basic_auth=("elastic", "9xIPonSzggYGcqR9N3Rz0YvT"),
)


class NightSafetyRisk:
    STREET_HARASSMENT         = "STREET_HARASSMENT"
    UNWANTED_PHYSICAL_CONTACT = "UNWANTED_PHYSICAL_CONTACT"
    SEXUAL_ASSAULT            = "SEXUAL_ASSAULT"

SEVERITY_WEIGHT = {
    NightSafetyRisk.SEXUAL_ASSAULT:            10,
    NightSafetyRisk.UNWANTED_PHYSICAL_CONTACT:  5,
    NightSafetyRisk.STREET_HARASSMENT:           3,
}

ENUM_DESCRIPTION = {
    NightSafetyRisk.STREET_HARASSMENT:
        "Verbal harassment, catcalling, intimidation on streets",
    NightSafetyRisk.UNWANTED_PHYSICAL_CONTACT:
        "Groping, unwanted touching in public places",
    NightSafetyRisk.SEXUAL_ASSAULT:
        "Sexual assault or attempted assault",
}

#create ES index with appropriate mappings for crime data
def create_index():
    if es.indices.exists(index="recorded_events"):
        print("Index already exists — skipping creation")
        return

    es.indices.create(index="recorded_events", body={
        "mappings": {
            "properties": {
                "location":    { "type": "geo_point" },
                "date":        { "type": "date", "format": "yyyy-MM-dd" },
                "type":        { "type": "keyword" },
                "description": { "type": "text" },
            }
        }
    })
    print("Index 'recorded_events' created")


#load data into elasticsearch from csv file
def load_csv_to_elasticsearch(filepath):
    from tqdm import tqdm
    from elasticsearch.helpers import bulk
    import hashlib

    count = es.count(index="recorded_events")["count"]
    if count >= 10000:
        print(f"Already have {count} events in ES — skipping load")
        return

    with open(filepath, newline="") as f:
        rows = list(csv.DictReader(f))

    def make_id(i, row):
        key = f"{row['latitude']}{row['longitude']}{row['date']}{row['type']}"
        return f"{i}_{hashlib.md5(key.encode()).hexdigest()}"

    actions = [
        {
            "_index": "recorded_events",
            "_id": make_id(i, row),
            "_source": {
                "location": {
                    "lat": float(row["latitude"]),
                    "lon": float(row["longitude"]),
                },
                "date":        row["date"],
                "type":        row["type"],
                "description": ENUM_DESCRIPTION.get(row["type"], ""),
            }
        }
        for i, row in enumerate(rows)
    ]

    success, failed = bulk(es, tqdm(actions, desc="Loading crime events", unit="event"))
    es.indices.refresh(index="recorded_events")
    print(f"Loaded {success} crime events into Elasticsearch ({failed} failed)")

def find_events_on_route(route, radius="150m", recent_days=None, types=None):
    coords = route["geometry"]["coordinates"]  # [[lng, lat], ...]
    radius_m = float(radius.replace("m", ""))

    # Bounding box with padding
    lats = [c[1] for c in coords]
    lngs = [c[0] for c in coords]
    pad = radius_m / 111000  # degrees padding
    filter_clauses = [
        {
            "geo_bounding_box": {
                "location": {
                    "top_left":     {"lat": max(lats) + pad, "lon": min(lngs) - pad},
                    "bottom_right": {"lat": min(lats) - pad, "lon": max(lngs) + pad},
                }
            }
        }
    ]

    if recent_days:
        filter_clauses.append({"range": {"date": {"gte": f"now-{recent_days}d/d"}}})
    if types:
        filter_clauses.append({"terms": {"type": types}})

    # Single query for all events in bounding box
    response = es.search(index="recorded_events", body={
        "query": {"bool": {"filter": filter_clauses}},
        "size": 10000,
    })

    # Filter in Python: keep only events within radius_m of any route point
    candidate_events = [
        {
            "id":          hit["_id"],
            "lat":         hit["_source"]["location"]["lat"],
            "lng":         hit["_source"]["location"]["lon"],
            "date":        hit["_source"]["date"],
            "type":        hit["_source"]["type"],
            "description": hit["_source"].get("description", ""),
        }
        for hit in response["hits"]["hits"]
    ]

    events = []
    seen_ids = set()
    for event in candidate_events:
        if event["id"] in seen_ids:
            continue
        # Check proximity to any route coordinate
        min_dist = float("inf")
        for lng, lat in coords:
            dlat = math.radians(event["lat"] - lat)
            dlng = math.radians(event["lng"] - lng)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(event["lat"])) * math.sin(dlng/2)**2
            dist = 2 * 6371000 * math.asin(math.sqrt(a))
            if dist < min_dist:
                min_dist = dist
            if min_dist <= radius_m:
                break
        if min_dist <= radius_m:
            seen_ids.add(event["id"])
            event["distance_m"] = round(min_dist, 1)
            events.append(event)

    return events

def score_route(route, radius="150m", recent_days=None, types=None):
    today        = datetime.today()
    total_risk   = 0.0
    route_events = []
    seen_ids     = set()

    # Check every coordinate point along the route
    events = find_events_on_route(route, radius=radius, recent_days=recent_days, types=types)

    for event in events:
        if event["id"] in seen_ids:
            continue
        seen_ids.add(event["id"])

        event_date    = datetime.strptime(event["date"], "%Y-%m-%d")
        days_ago      = (today - event_date).days
        decay         = 1 / (1 + days_ago / 90)
        weighted_risk = SEVERITY_WEIGHT.get(event["type"], 0) * decay

        total_risk += weighted_risk
        route_events.append({
            "event_id":    event["id"],
            "lat":         event["lat"],
            "lng":         event["lng"],
            "type":        event["type"],
            "date":        event["date"],
            "description": event["description"],
            "distance_m":  event["distance_m"],
            "risk":        round(weighted_risk, 2),
        })

    route_events.sort(key=lambda e: e["distance_m"])
    # Log scale: risk=0→100, risk=10→73, risk=100→60, risk=1000→40
    safety_score = max(0, round(100 - 20 * math.log10(1 + total_risk)))
    return {
        "distance_km":  route["distance"] /  1000,
        "eta_minutes":  route["duration"] / 60,
        "safety_score": safety_score,
        "total_risk":   round(total_risk, 2),
        "crime_count":  len(events),
        "route_events": route_events,
        "recommended":  False,
        "routes": route['geometry']['coordinates'],  # [lng, lat] for Mapbox frontend
    }

def rank_routes(routes, radius="150m", recent_days=None, types=None):
    print(f"\nScoring {len(routes)} routes against ES crime data...")

    scored = [
        score_route(route, radius, recent_days, types)
        for route in routes
    ]

    # Sort by safety score descending (safest first)
    scored.sort(key=lambda r: r["safety_score"], reverse=True)

    # Flag the winner
    scored[0]["recommended"] = True

    return scored

MAPBOX_TOKEN = os.getenv('MAPBOX_TOKEN')


def get_mapbox_routes(origin_lng, origin_lat, dest_lng, dest_lat, mode="driving"):
    """Fetch walking routes from Mapbox Directions API."""
    url = (
        f"https://api.mapbox.com/directions/v5/mapbox/{mode}/"
        f"{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
        f"?alternatives=true&geometries=geojson&overview=full&steps=false"
        f"&access_token={MAPBOX_TOKEN}"
    )
    res = requests.get(url)
    res.raise_for_status()
    return res.json().get("routes", [])

