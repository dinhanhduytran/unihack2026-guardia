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

def find_events_on_route(routes, radius="150m",
                          recent_days=None, types=None):
    hit_ids = set()   # track seen ES doc IDs to avoid duplicates
    events  = []
    for i in range(len(routes)):
        lat = routes["geometry"]["coordinates"][i][1]
        lng = routes["geometry"]["coordinates"][i][0]
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
            "type":        event["type"],
            "date":        event["date"],
            "description": event["description"],
            "distance_m":  event["distance_m"],
            "risk":        round(weighted_risk, 2),
        })

    route_events.sort(key=lambda e: e["distance_m"])
    safety_score = max(0, round(100 - total_risk * 2))
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


if __name__== "_main_":
    es.indices.delete(index="recorded_events")
    create_index()
    load_csv_to_elasticsearch("melbourne_safety.csv")

    # Melbourne coords: Watsonia → Bundoora
    origin_lat, origin_lng = -37.7116, 145.0819
    dest_lat, dest_lng     = -37.7063, 145.0612

    import json
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
