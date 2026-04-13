import requests
import os
from flask import Flask, request, jsonify, send_from_directory

# --------------------------------------------------
# Paths
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.abspath(os.path.join(BASE_DIR, "../front_end/dist"))

# --------------------------------------------------
# Flask app
# --------------------------------------------------
# app = Flask(
#     __name__,
#     static_folder=DIST_DIR,
#     static_url_path=""
# )
app = Flask(__name__)


meetups = {}

def geocode_location(text):
    if not text:
        return None, None, None

    query = f"{text}, Massachusetts"

    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": query,
                "format": "jsonv2",
                "limit": 1
            },
            headers={
                "User-Agent": "FairmeetPrototype/1.0"
            },
            timeout=10
        )

        results = response.json()

        if results:
            place = results[0]
            return (
                float(place["lat"]),
                float(place["lon"]),
                place.get("display_name")
            )

    except Exception as e:
        print("Geocode error:", e)

    return None, None, None

def compute_best_place(meetup):
    points = []

    # preferred area pulls center slightly
    if meetup.get("preferredAreaLat"):
        points.append((
            meetup["preferredAreaLat"],
            meetup["preferredAreaLon"]
        ))

    for p in meetup["participants"]:
        points.append((p["lat"], p["lon"]))

    if not points:
        return None

    avg_lat = sum(p[0] for p in points) / len(points)
    avg_lon = sum(p[1] for p in points) / len(points)

    print("new best place", (avg_lat, avg_lon))
    return {
        "name": "Suggested Meetup Center",
        "lat": avg_lat,
        "lon": avg_lon
    }


# --------------------------------------------------
# API routes
# --------------------------------------------------

# @app.route("/api/create-meetup", methods=["POST"])
# def create_meetup():
#     print("creating meetup...")
#     data = request.get_json()

#     if not data:
#         return jsonify({"error": "No JSON data received"}), 400

#     meetup_name = data.get("meetupName")
#     activity_type = data.get("activityType")
#     budget = data.get("budget")
#     preferred_area = (data.get("preferredArea") or "").strip()
#     indoor_outdoor = data.get("indoorOutdoor")
#     event_code = data.get("eventCode")
#     created_at = data.get("createdAt")
#     participants = data.get("participants", [])

#     print("Received meetup:")
#     print({
#         "meetupName": meetup_name,
#         "activityType": activity_type,
#         "budget": budget,
#         "preferredArea": preferred_area,
#         "indoorOutdoor": indoor_outdoor,
#         "eventCode": event_code,
#         "createdAt": created_at,
#         "participants": participants
#     })

#     lat = None
#     lon = None
#     location_name = None

#     if preferred_area:
#         query = f"{preferred_area}, Boston, Massachusetts"

#         try:
#             response = requests.get(
#                 "https://nominatim.openstreetmap.org/search",
#                 params={
#                     "q": query,
#                     "format": "jsonv2",
#                     "limit": 1
#                 },
#                 headers={
#                     "User-Agent": "FairmeetPrototype/1.0"
#                 },
#                 timeout=10
#             )

#             results = response.json()

#             if results:
#                 place = results[0]
#                 lat = float(place["lat"])
#                 lon = float(place["lon"])
#                 location_name = place.get("display_name")

#                 print(lat, lon)

#         except Exception as e:
#             print("Geocoding failed:", str(e))

#     meetups[event_code] = {
#         "message": "Meetup created successfully",
#         "eventCode": event_code,
#         "meetupName": meetup_name,
#         "activityType": activity_type,
#         "budget": budget,
#         "preferredArea": preferred_area,
#         "indoorOutdoor": indoor_outdoor,
#         "createdAt": created_at,
#         "participants": participants,
#         "mapLocation": {
#             "name": location_name,
#             "lat": lat,
#             "lon": lon
#         }
#     }

#     return jsonify(meetups[event_code]), 200

@app.route("/api/create-meetup", methods=["POST"])
def create_meetup():
    print("creating meetup...")
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    meetup_name = data.get("meetupName")
    activity_type = data.get("activityType")
    budget = data.get("budget")
    preferred_area = (data.get("preferredArea") or "").strip()
    indoor_outdoor = data.get("indoorOutdoor")
    event_code = data.get("eventCode")
    created_at = data.get("createdAt")
    participants = data.get("participants", [])

    print("Received meetup:")
    print({
        "meetupName": meetup_name,
        "activityType": activity_type,
        "budget": budget,
        "preferredArea": preferred_area,
        "indoorOutdoor": indoor_outdoor,
        "eventCode": event_code,
        "createdAt": created_at,
        "participants": participants
    })

    lat = None
    lon = None
    location_name = None

    if preferred_area:
        lat, lon, location_name = geocode_location(preferred_area)
        print("Preferred area geocoded to:", lat, lon)

    meetups[event_code] = {
        "message": "Meetup created successfully",
        "eventCode": event_code,
        "meetupName": meetup_name,
        "activityType": activity_type,
        "budget": budget,
        "preferredArea": preferred_area,
        "indoorOutdoor": indoor_outdoor,
        "createdAt": created_at,

        # keep existing field
        "participants": participants,

        # keep existing field for map display
        "mapLocation": {
            "name": location_name,
            "lat": lat,
            "lon": lon
        },

        # extra fields for future recomputation
        "preferredAreaLat": lat,
        "preferredAreaLon": lon,
        "preferredAreaName": location_name,

        # new current recommendation
        "bestPlace": {
            "name": location_name or "Preferred Area",
            "lat": lat,
            "lon": lon
        }
    }

    return jsonify(meetups[event_code]), 200


@app.route("/api/join-meetup", methods=["POST"])
def join_meetup():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    event_code = data.get("eventCode")
    name = data.get("name")
    location_text = (data.get("location") or "").strip()

    meetup = meetups.get(event_code)

    if not meetup:
        return jsonify({"error": "Meetup not found"}), 404

    lat, lon, location_name = geocode_location(location_text)

    new_participant = {
        "name": name,
        "location": location_text,
        "locationName": location_name,
        "lat": lat,
        "lon": lon
    }
    print(name, location_name)

    meetup["participants"].append(new_participant)

    meetup["bestPlace"] = compute_best_place(meetup)

    # keep mapLocation synced with current recommendation
    meetup["mapLocation"] = meetup["bestPlace"]
    return jsonify(meetup), 200


@app.route("/api/meetup/<event_code>", methods=["GET"])
def get_meetup(event_code):
    meetup = meetups.get(event_code)

    if not meetup:
        return jsonify({"error": "Meetup not found"}), 404

    return jsonify(meetup), 200



# Example test route
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# --------------------------------------------------
# Frontend routes
# --------------------------------------------------

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    # print("serve_react hit with path:", path)

    requested_path = os.path.join(DIST_DIR, path)

    if path and os.path.exists(requested_path):
        return send_from_directory(DIST_DIR, path)

    # print("Falling back to index.html")
    return send_from_directory(DIST_DIR, "index.html")

# --------------------------------------------------
# Run app
# --------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)