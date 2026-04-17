import math
import requests

from models import RecommendationItem, RecommendationResult, Venue


LOCAL_GEOCODES = {
    "boston": (42.3601, -71.0589, "Boston, Massachusetts"),
    "back bay": (42.3503, -71.0810, "Back Bay, Boston, Massachusetts"),
    "allston": (42.3555, -71.1328, "Allston, Boston, Massachusetts"),
    "cambridge": (42.3736, -71.1097, "Cambridge, Massachusetts"),
    "mit": (42.3601, -71.0942, "MIT, Cambridge, Massachusetts"),
    "harvard": (42.3732, -71.1189, "Harvard Square, Cambridge, Massachusetts"),
    "brookline": (42.3318, -71.1212, "Brookline, Massachusetts"),
    "somerville": (42.3876, -71.0995, "Somerville, Massachusetts"),
    "downtown": (42.3555, -71.0604, "Downtown Boston, Massachusetts"),
}


def haversine_miles(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return None

    radius = 3958.8
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius * c


def geocode_location(text):
    # A few local shortcuts make demos faster and reduce calls to Nominatim
    if not text:
        return None, None, None

    cleaned = text.strip().lower()
    for key, value in LOCAL_GEOCODES.items():
        if key in cleaned:
            return value

    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": f"{text}, Massachusetts", "format": "jsonv2", "limit": 1},
            headers={"User-Agent": "FairmeetPrototype/1.0"},
            timeout=8,
        )
        response.raise_for_status()
        results = response.json()
        if results:
            place = results[0]
            return float(place["lat"]), float(place["lon"]), place.get("display_name")
    except Exception as exc:
        print("Geocode error:", exc)

    return None, None, None


def compute_center(meetup, participants):
    # Start with the preferred area, then pull the center toward participant locations
    points = []

    if meetup.preferred_lat is not None and meetup.preferred_lon is not None:
        points.append((meetup.preferred_lat, meetup.preferred_lon))

    for participant in participants:
        if participant.latitude is not None and participant.longitude is not None:
            points.append((participant.latitude, participant.longitude))

    if not points:
        return 42.3601, -71.0589

    lat = sum(point[0] for point in points) / len(points)
    lon = sum(point[1] for point in points) / len(points)
    return lat, lon


def get_overpass_filters(activity_type):
    activity = (activity_type or "").strip().lower()
    mapping = {
        "coffee": [("amenity", "cafe")],
        "food": [("amenity", "restaurant")],
        "drinks": [("amenity", "bar"), ("amenity", "pub")],
        "study": [("amenity", "library"), ("amenity", "cafe")],
        "entertainment": [("amenity", "cinema")],
    }
    return mapping.get(activity, [("amenity", "cafe"), ("amenity", "restaurant")])


def category_for_tags(tags):
    if tags.get("amenity") == "cafe":
        return "cafe"
    if tags.get("amenity") == "restaurant":
        return "restaurant"
    if tags.get("amenity") in ("bar", "pub"):
        return "bar"
    if tags.get("amenity") == "library":
        return "library"
    if tags.get("amenity") == "cinema":
        return "cinema"
    return tags.get("amenity") or "place"


def sample_venues(activity_type, lat, lon):
    # Fallback venues keep the app usable if Overpass is slow or offline
    activity = (activity_type or "coffee").lower()
    templates = {
        "coffee": [("Central Cafe", "cafe", "$"), ("Study Grounds", "cafe", "$$")],
        "food": [("Fair Table Restaurant", "restaurant", "$$"), ("Neighborhood Kitchen", "restaurant", "$")],
        "drinks": [("Meetup Pub", "bar", "$$"), ("Evening Tap", "pub", "$$")],
        "study": [("Community Library", "library", "$"), ("Quiet Cafe", "cafe", "$")],
        "entertainment": [("Central Cinema", "cinema", "$$"), ("Arts Theater", "theatre", "$$")],
    }
    rows = templates.get(activity, templates["coffee"])
    offsets = [(0.002, 0.002), (-0.002, 0.001), (0.001, -0.002)]

    venues = []
    for index, row in enumerate(rows):
        off = offsets[index % len(offsets)]
        venues.append(
            Venue(
                name=row[0],
                address="Greater Boston area",
                latitude=lat + off[0],
                longitude=lon + off[1],
                category=row[1],
                price_level=row[2],
                source="sample",
            )
        )
    return venues


def search_real_venues(lat, lon, activity_type, radius_m=1600):
    if lat is None or lon is None:
        lat, lon = 42.3601, -71.0589

    filters = get_overpass_filters(activity_type)
    parts = []
    for key, value in filters:
        parts.append(f'node(around:{radius_m},{lat},{lon})["{key}"="{value}"];')
        parts.append(f'way(around:{radius_m},{lat},{lon})["{key}"="{value}"];')
        parts.append(f'relation(around:{radius_m},{lat},{lon})["{key}"="{value}"];')

    query = f"""
    [out:json][timeout:20];
    (
      {"".join(parts)}
    );
    out center;
    """

    try:
        response = requests.get(
            "https://overpass-api.de/api/interpreter",
            params={"data": query},
            headers={"User-Agent": "FairmeetPrototype/1.0"},
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()

        venues = []
        seen = set()
        for element in data.get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name")
            if not name:
                continue

            venue_lat = element.get("lat")
            venue_lon = element.get("lon")
            if venue_lat is None or venue_lon is None:
                center = element.get("center", {})
                venue_lat = center.get("lat")
                venue_lon = center.get("lon")
            if venue_lat is None or venue_lon is None:
                continue

            key = (name.lower(), round(float(venue_lat), 5), round(float(venue_lon), 5))
            if key in seen:
                continue
            seen.add(key)

            address_parts = [
                tags.get("addr:housenumber"),
                tags.get("addr:street"),
                tags.get("addr:city"),
            ]
            address = ", ".join(part for part in address_parts if part) or tags.get("addr:full") or ""

            venues.append(
                Venue(
                    name=name,
                    address=address,
                    latitude=float(venue_lat),
                    longitude=float(venue_lon),
                    category=category_for_tags(tags),
                    price_level=tags.get("price") or tags.get("price_level") or "",
                    source="overpass",
                )
            )

            if len(venues) >= 12:
                break

        if venues:
            return venues
    except Exception as exc:
        print("Overpass venue search failed:", exc)

    return sample_venues(activity_type, lat, lon)


class RecommendationEngine:
    def __init__(self, fairness_weight=0.7, preference_weight=0.3):
        self.fairness_weight = fairness_weight
        self.preference_weight = preference_weight

    def generateRecommendations(self, meetup, participants, venues):
        # Rank every candidate, then keep the top few for the UI
        if not venues:
            lat, lon = compute_center(meetup, participants)
            venues = sample_venues(meetup.activity_type, lat, lon)

        items = []
        for venue in venues:
            distance_score, avg_distance, max_distance = self.computeDistanceScore(participants, venue, meetup)
            preference_score, matched = self.computePreferenceScore(meetup, participants, venue)
            final_score = self.computeFinalScore(distance_score, preference_score)
            reason = (
                f"This venue has an average travel distance of {avg_distance:.1f} miles "
                f"and the farthest participant travels {max_distance:.1f} miles."
            )
            if matched:
                reason += " It matches " + ", ".join(matched) + "."

            items.append(
                RecommendationItem(
                    venue=venue,
                    final_score=final_score,
                    avg_distance=avg_distance,
                    max_distance=max_distance,
                    matched_preferences=matched,
                    reason_text=reason,
                )
            )

        items.sort(key=lambda item: item.final_score, reverse=True)
        for index, item in enumerate(items[:5], start=1):
            item.rank_no = index

        return RecommendationResult(meetup_id=meetup.meetup_id, ranked_venues=items[:5])

    def computeDistanceScore(self, participants, venue, meetup=None):
        # Lower average and max distance means a better fairness score
        distances = []
        for participant in participants:
            distance = haversine_miles(
                participant.latitude,
                participant.longitude,
                venue.latitude,
                venue.longitude,
            )
            if distance is not None:
                distances.append(distance)

        if not distances and meetup:
            distance = haversine_miles(
                meetup.preferred_lat,
                meetup.preferred_lon,
                venue.latitude,
                venue.longitude,
            )
            if distance is not None:
                distances.append(distance)

        if not distances:
            return 60.0, 0.0, 0.0

        avg_distance = sum(distances) / len(distances)
        max_distance = max(distances)
        score = 100 - 5 * avg_distance - 2 * max_distance
        return max(0, min(100, score)), avg_distance, max_distance

    def computePreferenceScore(self, meetup, participants, venue):
        # Preferences are simple for now: activity and budget do most of the work
        matched = []
        score = 40.0

        budget = meetup.budget_level or ""
        activity = meetup.activity_type or ""

        participant_budgets = [p.budget_preference for p in participants if p.budget_preference]
        if not budget and participant_budgets:
            budget = participant_budgets[0]

        if venue.matchesActivity(activity):
            score += 35
            if activity:
                matched.append(activity.capitalize())

        if venue.matchesBudget(budget):
            score += 20
            if budget:
                matched.append(budget)

        if meetup.indoor_outdoor and meetup.indoor_outdoor != "Any":
            matched.append(meetup.indoor_outdoor)
            score += 5

        return max(0, min(100, score)), matched

    def computeFinalScore(self, distance_score, preference_score):
        return distance_score * self.fairness_weight + preference_score * self.preference_weight
