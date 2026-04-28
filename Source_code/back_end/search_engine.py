import math
import requests


def haversine_miles(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return None

    R = 3958.8  # Earth radius in miles

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def build_meetup_summary(meetup):
    best_place = meetup.get("bestPlace") or meetup.get("mapLocation") or {}
    participants = meetup.get("participants", [])

    distances = []
    for p in participants:
        d = haversine_miles(
            p.get("lat"),
            p.get("lon"),
            best_place.get("lat"),
            best_place.get("lon")
        )
        if d is not None:
            distances.append(d)

    avg_distance = round(sum(distances) / len(distances), 1) if distances else 0.0
    max_distance = round(max(distances), 1) if distances else 0.0

    raw_score = 100 - 5 * avg_distance - 2 * max_distance
    fairness_score = max(0, min(100, round(raw_score)))

    matched_preferences = []
    if meetup.get("activityType"):
        matched_preferences.append(meetup["activityType"].capitalize())
    if meetup.get("indoorOutdoor"):
        matched_preferences.append(meetup["indoorOutdoor"])
    if meetup.get("budget"):
        matched_preferences.append(meetup["budget"])

    explanation = (
        f"This suggested place balances travel for the current group. "
        f"The average distance is {avg_distance} miles and the furthest participant "
        f"travels {max_distance} miles. It aligns with the selected preferences."
    )

    return {
        "fairnessScore": fairness_score,
        "avgDistance": avg_distance,
        "maxDistance": max_distance,
        "matchedPreferences": matched_preferences,
        "explanation": explanation
    }


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

def get_overpass_filters(activity_type):
    activity = (activity_type or "").strip().lower()

    mapping = {
        "coffee": [('amenity', 'cafe')],
        "food": [('amenity', 'restaurant')],
        "drinks": [('amenity', 'bar'), ('amenity', 'pub')],
        "study": [('amenity', 'cafe'), ('amenity', 'library')],
        "entertainment": [('amenity', 'cinema')]
    }

    return mapping.get(activity, [('amenity', 'cafe')])

def search_real_venues(lat, lon, activity_type, radius_m=1500):
    if lat is None or lon is None:
        return []

    filters = get_overpass_filters(activity_type)

    query_parts = []
    for key, value in filters:
        query_parts.append(f'node(around:{radius_m},{lat},{lon})["{key}"="{value}"];')
        query_parts.append(f'way(around:{radius_m},{lat},{lon})["{key}"="{value}"];')
        query_parts.append(f'relation(around:{radius_m},{lat},{lon})["{key}"="{value}"];')

    overpass_query = f"""
    [out:json][timeout:20];
    (
      {"".join(query_parts)}
    );
    out center;
    """

    try:
        response = requests.get(
            "https://overpass-api.de/api/interpreter",
            params={"data": overpass_query},
            headers={"User-Agent": "FairmeetPrototype/1.0"},
            timeout=20
        )
        response.raise_for_status()
        data = response.json()

        venues = []
        for el in data.get("elements", []):
            tags = el.get("tags", {})
            name = tags.get("name")
            if not name:
                continue

            venue_lat = el.get("lat")
            venue_lon = el.get("lon")

            if venue_lat is None or venue_lon is None:
                center = el.get("center", {})
                venue_lat = center.get("lat")
                venue_lon = center.get("lon")

            if venue_lat is None or venue_lon is None:
                continue

            address_parts = [
                tags.get("addr:housenumber"),
                tags.get("addr:street"),
                tags.get("addr:city")
            ]
            address = ", ".join([p for p in address_parts if p]) or tags.get("addr:full") or ""

            venues.append({
                "name": name,
                "lat": venue_lat,
                "lon": venue_lon,
                "address": address,
                "source": "overpass"
            })

        return venues

    except Exception as e:
        print("Overpass venue search failed:", str(e))
        return []

def choose_best_venue(meetup, venues, fallback_center):
    if not venues:
        return fallback_center

    participants = meetup.get("participants", [])
    best_venue = None
    best_score = float("inf")

    for venue in venues:
        distances = []

        for p in participants:
            if p.get("lat") is None or p.get("lon") is None:
                continue

            d = haversine_miles(
                p["lat"],
                p["lon"],
                venue["lat"],
                venue["lon"]
            )
            if d is not None:
                distances.append(d)

        total_distance = sum(distances) if distances else 0.0
        max_distance = max(distances) if distances else 0.0

        # small penalty if venue is far from preferred area
        preferred_penalty = 0.0
        if meetup.get("preferredAreaLat") is not None and meetup.get("preferredAreaLon") is not None:
            d_pref = haversine_miles(
                meetup["preferredAreaLat"],
                meetup["preferredAreaLon"],
                venue["lat"],
                venue["lon"]
            )
            preferred_penalty = d_pref or 0.0

        score = total_distance + 1.5 * max_distance + 0.3 * preferred_penalty

        if score < best_score:
            best_score = score
            best_venue = venue

    return best_venue or fallback_center
