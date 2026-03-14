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
    # Check if already loaded
    count = es.count(index="recorded_events")["count"]
    if count > 0:
        print(f"Already have {count} events in ES — skipping load")
        return

    loaded = 0
    with open(filepath, newline="") as f:
        for row in csv.DictReader(f):
            event_type = row["type"]
            es.index(index="recorded_events", body={

                "location": {
                    "lat": float(row["latitude"]),
                    "lon": float(row["longitude"]),
                },
                "date":        row["date"],
                "type":        event_type,
                "description": ENUM_DESCRIPTION.get(event_type, ""),
            })
            loaded += 1

    # Refresh index so documents are immediately searchable
    es.indices.refresh(index="recorded_events")
    print(f"Loaded {loaded} crime events into Elasticsearch")

def find_events_on_route(lat,lng, radius="150m",
                          recent_days=None, types=None):
    hit_ids = set()   # track seen ES doc IDs to avoid duplicates
    events  = []


    must_clauses = [
            {
                "geo_distance": {
                    "distance": radius,
                    "location": {
                        "lat": lat,
                        "lon": lng,
                    }
                }
            }
        ]

    filter_clauses = []

    if recent_days:
            filter_clauses.append({
                "range": {
                    "date": { "gte": f"now-{recent_days}d/d" }
                }
            })

    if types:
            filter_clauses.append({
                "terms": { "type": types }
            })

    query = {
            "query": {
                "bool": {
                    "must":   must_clauses,
                    "filter": filter_clauses,
                }
            },
            "sort": [
                {
                    "_geo_distance": {
                        "location": { "lat": lat, "lon": lng },
                        "order":    "asc",
                        "unit":     "m",
                    }
                }
            ],
            "size": 1000
        }

    response = es.search(index="recorded_events", body=query)

    for hit in response["hits"]["hits"]:
            if hit["_id"] in hit_ids:
                continue

            hit_ids.add(hit["_id"])
            source     = hit["_source"]
            distance_m = hit["sort"][0]

            events.append({
                "id":          hit["_id"],
                "lat":         source["location"]["lat"],
                "lng":         source["location"]["lon"],
                "date":        source["date"],
                "type":        source["type"],
                "description": source.get("description", ""),
                "distance_m":  round(distance_m, 1),
            })

    return events

def score_route(route, radius="150m", recent_days=None, types=None):
    today        = datetime.today()
    total_risk   = 0.0
    route_events = []
    seen_ids     = set()

    # Check every coordinate point along the route
    for lat, lng in route["points"]:
        events = find_events_on_route(lat, lng, radius=radius, recent_days=recent_days, types=types)

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
                "type":        event["type"],
                "date":        event["date"],
                "description": event["description"],
                "distance_m":  event["distance_m"],
                "risk":        round(weighted_risk, 2),
            })

    route_events.sort(key=lambda e: e["distance_m"])
    safety_score = max(0, round(100 - total_risk * 2))

    return {
        "id":           route["id"],
        "label":        route["label"],
        "distance_km":  route["distance_km"],
        "eta_minutes":  route["eta_minutes"],
        "safety_score": safety_score,
        "total_risk":   round(total_risk, 2),
        "crime_count":  len(events),
        "route_events": route_events,
        "recommended":  False,
        "routes": [[lng, lat] for lat, lng in route["points"]]  # [lng, lat] for Mapbox frontend
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


def get_mapbox_routes(origin_lng, origin_lat, dest_lng, dest_lat, mode="walking"):
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


if __name__ == "__main__":
    # es.indices.delete(index="recorded_events")
    create_index()
    load_csv_to_elasticsearch("dummy_data.csv")

    # Melbourne coords: Watsonia → Bundoora
    origin_lat, origin_lng = -37.7116, 145.0819
    dest_lat, dest_lng     = -37.7063, 145.0612

    import json
    mapbox_routes = get_mapbox_routes(origin_lng, origin_lat, dest_lng, dest_lat)

    results = []
    for i,route in enumerate(mapbox_routes):
        coords = route["geometry"]["coordinates"]  # [[lng, lat], ...]
        today = datetime.today()
        total_points = len(coords)
        cumulative_distance = 0.0
        cumulative_duration = 0.0

        for idx, (lng, lat) in enumerate(coords):
            segment_m = 0.0
            segment_min = 0.0
            if idx > 0:
                prev_lng, prev_lat = coords[idx - 1]
                R = 6371000
                phi1, phi2 = math.radians(prev_lat), math.radians(lat)
                dphi = math.radians(lat - prev_lat)
                dlambda = math.radians(lng - prev_lng)
                a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
                segment_m = 2 * R * math.asin(math.sqrt(a))
                segment_min = (segment_m / route["distance"]) * (route["duration"] / 60)
                cumulative_distance += segment_m
                cumulative_duration += segment_min

            events = find_events_on_route(lat, lng, radius="150m", recent_days=90)
            total_risk = 0.0
            for event in events:
                days_ago = (today - datetime.strptime(event["date"], "%Y-%m-%d")).days
                decay = 1 / (1 + days_ago / 90)
                total_risk += SEVERITY_WEIGHT.get(event["type"], 0) * decay

            results.append({
                "geometry":    {"coordinates": [lng, lat], "type": "Point"},
                "distance":    round(segment_m, 2),
                "duration":    round(segment_min, 2),
                "weight":      max(0, round(100 - total_risk * 2)),
                "weight_name": f"route{idx+1}",
            })

    print(f"\n--- Route {i+1} verification ---")
    print(f"Mapbox distance:  {route['distance']:.2f} m  |  Haversine sum: {cumulative_distance:.2f} m  |  diff: {abs(route['distance'] - cumulative_distance):.2f} m")
    print(f"Mapbox duration:  {route['duration']/60:.2f} min  |  Cumulative:     {cumulative_duration:.2f} min  |  diff: {abs(route['duration']/60 - cumulative_duration):.2f} min")

    print(json.dumps(results, indent=2))
