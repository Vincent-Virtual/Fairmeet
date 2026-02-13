from flask import Flask, jsonify, send_from_directory
from pathlib import Path
from math import radians, sin, cos, sqrt, atan2

BASE_DIR = Path(__file__).resolve().parent          # .../Source_code/backend
FRONTEND_DIR = (BASE_DIR / ".." / "front_end").resolve()

app = Flask(__name__)

@app.get("/")
def home():
    # serves Source_code/front_end/index.html
    return send_from_directory(FRONTEND_DIR, "index.html")

# Optional: serve other frontend files if you add them later (css/js/images)
@app.get("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)


# ---------------- Demo backend logic ----------------

VENUES = [
    {"id": "c1", "name": "Cafe Nebula", "tag": "coffee", "lat": 42.3512, "lng": -71.1156},
    {"id": "c2", "name": "Espresso Harbor", "tag": "coffee", "lat": 42.3635, "lng": -71.1030},
    {"id": "m1", "name": "Cinema Aurora", "tag": "movies", "lat": 42.3539, "lng": -71.0640},
    {"id": "s1", "name": "Powder Peak (mock)", "tag": "skiing", "lat": 42.5280, "lng": -71.7900},
]

DEMO_PEOPLE = [
    {"name": "Vincent", "lat": 42.361, "lng": -71.105, "prefs": {"coffee": 1.0, "movies": 0.2, "skiing": 0.1}},
    {"name": "Alice",   "lat": 42.345, "lng": -71.085, "prefs": {"coffee": 0.7, "movies": 0.9, "skiing": 0.0}},
    {"name": "Bob",     "lat": 42.372, "lng": -71.120, "prefs": {"coffee": 0.8, "movies": 0.1, "skiing": 0.2}},
]
ACTIVITY_TAGS = ["coffee", "movies", "skiing"]


def haversine_m(lat1, lng1, lat2, lng2) -> float:
    R = 6371000.0
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lng2 - lng1)
    a = sin(dphi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(dlambda / 2) ** 2
    return 2 * R * atan2(sqrt(a), sqrt(1 - a))


def centroid(points):
    n = len(points)
    return {"lat": sum(p["lat"] for p in points) / n,
            "lng": sum(p["lng"] for p in points) / n}


def choose_activity(people, tags):
    # maximize min preference, tie-break by avg
    scores = {}
    for t in tags:
        vals = [float(p.get("prefs", {}).get(t, 0.0)) for p in people]
        scores[t] = {"min": min(vals), "avg": sum(vals) / len(vals)}
    best = max(tags, key=lambda t: (scores[t]["min"], scores[t]["avg"]))
    return best, scores


def best_venue(people, venues, alpha=0.7):
    best = None
    for v in venues:
        ds = [haversine_m(p["lat"], p["lng"], v["lat"], v["lng"]) for p in people]
        mx, mean = max(ds), sum(ds) / len(ds)
        cost = alpha * mx + (1 - alpha) * mean
        cand = (cost, mx, mean, v)
        if best is None or cand[0] < best[0]:
            best = cand
    cost, mx, mean, v = best
    return v, mx, mean


@app.get("/api/demo")
def api_demo():
    meet = centroid(DEMO_PEOPLE)
    activity, activity_scores = choose_activity(DEMO_PEOPLE, ACTIVITY_TAGS)
    candidates = [v for v in VENUES if v["tag"] == activity] or VENUES
    v, mx, mean = best_venue(DEMO_PEOPLE, candidates)

    return jsonify({
        "people": [{"name": p["name"], "lat": p["lat"], "lng": p["lng"]} for p in DEMO_PEOPLE],
        "meeting_point": meet,
        "activity": activity,
        "activity_scores": activity_scores,
        "best_venue": {
            "id": v["id"], "name": v["name"], "tag": v["tag"], "lat": v["lat"], "lng": v["lng"],
            "max_distance_km": round(mx / 1000, 2),
            "mean_distance_km": round(mean / 1000, 2),
        }
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

