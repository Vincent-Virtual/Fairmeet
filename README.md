# FairMeet

FairMeet is a web-based application that helps groups find a fair and convenient meetup location based on participants’ locations and preferences.

The system computes a balanced meeting point and recommends real-world venues that minimize travel distance while matching activity preferences.

---

# Features

* Create and share meetup events via event code
* Join meetups with location input
* Dynamic recomputation as participants join
* Fairness-aware venue recommendation
* Interactive map with participant and venue markers

---

# Project Structure

```text
Source_code/
├── front_end/    # React + Vite frontend
├── back_end/     # Flask backend and search engine
```

---

# How to Run

## 1. Build frontend

```bash
cd Source_code/front_end
npm install
npm run build
```

## 2. Start backend

```bash
cd ../back_end
python3 app.py
```

## 3. Open in browser

```
http://127.0.0.1:5001
```

---

# Frontend Details

See:

```
Source_code/front_end/README.md
```

for detailed frontend build instructions.

---

# Backend Overview

* Flask API server
* REST endpoints for meetup management
* Geocoding using OpenStreetMap
* Custom search engine for venue recommendation

---

# Search Engine Design

The system implements a retrieve-and-rank pipeline:

1. Compute a fair geographic center from participants
2. Retrieve nearby candidate venues
3. Rank venues using distance and fairness metrics
4. Return the best venue recommendation

---

# Technologies Used

* React + Vite
* Flask (Python)
* OpenStreetMap (Nominatim + Overpass)
* Leaflet (map visualization)

---

# Notes

* Frontend is served via Flask after build
* No database is used (in-memory storage)
* Designed as a prototype system

---

# Authors

[Vincent Liu, Liv Freund, Amar Houacine, Pouria Asadi, Muhua Zhang]
