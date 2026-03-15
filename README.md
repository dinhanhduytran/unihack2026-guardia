# Guardia — Walk Home Safer

> A real-time safety companion for women walking alone at night.

---

## The Problem

One in three women in Australia has experienced physical violence. Walking alone at night remains one of the most common situations where women feel unsafe — yet existing navigation apps like Google Maps only optimise for speed, not safety.

**Women deserve a route that is safe, not just fast.**

---

## What Guardia Does

Guardia is a mobile web app that helps women get home safer by:

1. **Finding the safest walking route** — not the fastest one
2. **Showing where past incidents happened** along the way
3. **Warning you in real time** as you approach a danger zone
4. **Connecting you to an AI companion** who stays on the call with you the entire journey

---

## How It Works

```
You enter your destination
        ↓
Guardia fetches multiple walking routes
        ↓
Each route is scored against 10,000 real crime incident records
        ↓
The safest route is recommended — you see incident spots on the map
        ↓
You start your journey — Guardia watches your location
        ↓
As you get close to a known incident spot, your phone speaks a warning
        ↓
An AI companion is available the whole time — just tap to connect
```

---

## Key Features

### Safe Route Scoring
Every route is given a **Safety Score out of 100**, calculated from real crime data. Incidents that happened recently and were more severe carry more weight. The app always recommends the route with the highest score.

### Live Incident Map
Known incident locations appear as markers on your map. As you walk closer to one, the marker turns from grey to red — a visual warning before you even get there.

### Voice Alerts
When you are within 150 metres of a past incident, the app **speaks a warning aloud** so you don't need to look at your phone.

### AI Safety Companion
At any point during your walk, you can open a **live video call with an AI companion**. She stays with you, listens to you, and can guide you if you feel unsafe — like having a friend on the phone.

### One-Tap SOS
If something goes wrong, a single button triggers the emergency screen.

---

## The Data

Guardia uses **10,000 recorded safety incidents** across Melbourne, sourced and processed using the **Elastic Web Crawler** — which automatically crawled and indexed publicly available crime and safety reports into Elasticsearch. The data was then cleaned, categorised, and tagged with precise GPS coordinates for map use.

Incidents are classified into three categories:

| Incident Type | Weight |
|---|---|
| Sexual assault | High |
| Unwanted physical contact | Medium |
| Street harassment / catcalling | Low |

Recent incidents are weighted more heavily than older ones. The algorithm balances both the severity of what happened and how long ago it happened.

---

## Demo

**Live app:** [safetyroute.vercel.app](https://safetyroute.vercel.app)

Try a route:
- Your location is detected automatically — just enter a destination (e.g. `Flinders Street Station, Melbourne`)

---

## Technology

Built in under 48 hours at **UniHack 2026**.

| Layer | Technology |
|---|---|
| Mobile web app | React + TypeScript |
| Map & routing | Mapbox |
| Data collection | Elastic Web Crawler |
| Crime data search | Elasticsearch |
| AI companion | HeyGen Streaming Avatar |
| Backend API | Python / FastAPI |
| Cloud hosting | AWS App Runner + Vercel |

---

## The Team

Built by a team of students passionate about women's safety and real-world impact.

---

## What's Next

- Expand crime data coverage beyond Melbourne
- Allow users to anonymously report incidents in real time, growing the dataset
- Push notifications when a safe check-in is missed
- Integration with emergency services (triple zero pre-fill)
- Android / iOS native app

---

*Guardia — because getting home safe should never be an afterthought.*
