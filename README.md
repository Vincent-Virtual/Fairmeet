> Branch note: `merge/backend-muhua` is used to merge `feature/backend-muhua` back into the project and avoid a large amount of conflicts going straight into main.

# FairMeet

FairMeet is a web application that helps a group find a fair meetup location. It uses participant locations, activity preferences, and budget choices to recommend nearby venues.

---

# Features

* Create and share meetup events with an event code
* Join a meetup with name, address, and preferences
* Search address suggestions or pick a location on the map
* Recalculate recommendations as participants join
* Show recommended venues and participant locations on an interactive map
* Open selected venues in Google Maps

---

# Project Structure

```text
Source_code/
├── front_end/    # React + Vite frontend
└── back_end/     # Flask backend, PostgreSQL storage, and recommendation engine
```

---

# How to Run

## 1. Install frontend packages

```bash
cd Source_code/front_end
npm install
```

## 2. Build frontend

```bash
npm run build
```

## 3. Install backend packages

```bash
cd ../back_end
pip install -r requirements.txt
```

## 4. Start backend

```bash
python app.py
```

## 5. Open in browser

```text
http://127.0.0.1:5001
```

---

# Database

The backend supports PostgreSQL by default:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fairmeet
```

If PostgreSQL is not available, the app can fall back to in-memory storage for local preview work. To force memory mode:

```bash
FAIRMEET_STORAGE=memory python app.py
```

The database tables are defined in:

```text
Source_code/back_end/schema.sql
```

---

# Backend Overview

* Flask API server
* PostgreSQL database layer with memory fallback
* REST endpoints for meetup creation, joining, planning, and results
* Address lookup with OpenStreetMap Nominatim
* Venue search with OpenStreetMap Overpass
* Recommendation scoring based on distance fairness and preferences

---

# Main API Routes

```text
POST /api/create-meetup
POST /api/join-meetup
POST /api/plan
GET  /api/meetup/<event_code>
GET  /api/result/<event_code>
GET  /api/geocode?q=<address>
GET  /api/health
```

---

# Notes

* The frontend is served by Flask after running `npm run build`
* Live address and venue search depend on external OpenStreetMap services
* Local fallback data keeps the app usable when map APIs are slow or unavailable

---

# Authors

Vincent Liu ([@Vincent-Virtual](https://github.com/Vincent-Virtual)), Liv Freund ([@livfreund](https://github.com/livfreund)), Amar Houacine ([@amarhouacine](https://github.com/amarhouacine)), Pouria Asadi ([@PouriaAsadi1](https://github.com/PouriaAsadi1)), Muhua Zhang ([@WorldlineChanger](https://github.com/WorldlineChanger))
