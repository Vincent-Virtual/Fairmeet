import random
import string

from database import get_database
from models import Meetup, Participant
from search_engine import RecommendationEngine, compute_center, geocode_location, search_real_venues


def to_float(value):
    # Form values sometimes arrive as strings. The engine just wants numbers or None
    if value in (None, ""):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


class MeetupService:
    def __init__(self, database=None, engine=None):
        self.database = database or get_database()
        self.engine = engine or RecommendationEngine()

    def createMeetup(self, data, base_url=""):
        # Create the parent meetup first, then attach any starter participants
        event_code = (data.get("eventCode") or self.make_event_code()).upper()
        title = data.get("meetupName") or data.get("title") or ""
        preferred_area = (data.get("preferredArea") or "").strip()
        budget_level = data.get("budget") or data.get("budgetLevel") or ""
        activity_type = data.get("activityType") or ""
        indoor_outdoor = data.get("indoorOutdoor") or "Any"
        created_at = data.get("createdAt")

        if not title.strip():
            raise ValueError("Meetup name is required")

        if not preferred_area:
            raise ValueError("Preferred area is required")

        lat = to_float(data.get("preferredAreaLat"))
        lon = to_float(data.get("preferredAreaLon"))
        area_name = data.get("preferredAreaName")

        if lat is None or lon is None:
            lat, lon, area_name = geocode_location(preferred_area)

        if lat is None or lon is None:
            raise ValueError("Please choose an address suggestion or pick the area on the map")

        meetup = Meetup(
            event_code=event_code,
            title=title,
            preferred_area=preferred_area,
            budget_level=budget_level,
            activity_type=activity_type,
            indoor_outdoor=indoor_outdoor,
            created_at=created_at,
            preferred_lat=lat,
            preferred_lon=lon,
            preferred_area_name=area_name,
        ).createMeetup()

        meetup = self.database.create_meetup(meetup, self.make_share_uri(base_url, event_code))

        # The creator also counts as a participant for distance scoring
        self.addParticipantFromData(meetup, {
            "name": data.get("creatorName") or data.get("ownerName") or "Creator",
            "role": "creator",
            "location": preferred_area,
            "locationName": area_name,
            "lat": lat,
            "lon": lon,
            "budgetPreference": budget_level,
            "activityPreference": activity_type,
            "indoorOutdoor": indoor_outdoor,
            "createdAt": created_at,
        })

        for participant_data in data.get("participants", []):
            self.addParticipantFromData(meetup, participant_data)

        # Generate an initial result so the Event Created page can already show a map
        self.generatePlan(event_code)
        return self.fetchMeetup(event_code)

    def joinMeetup(self, data):
        # Joining a meetup is also a good time to update the recommendation list
        event_code = (data.get("eventCode") or "").upper()
        meetup = self.database.get_meetup_by_code(event_code)
        if not meetup:
            raise LookupError("Meetup not found")

        participant = self.addParticipantFromData(meetup, data)
        meetup.addParticipant(participant)
        self.generatePlan(event_code)
        return self.fetchMeetup(event_code)

    def generatePlan(self, event_code):
        # Service coordinates the pieces: session data, venue search, scoring, then storage
        event_code = (event_code or "").upper()
        meetup = self.database.get_meetup_by_code(event_code)
        if not meetup:
            raise LookupError("Meetup not found")

        participants = self.database.get_participants(meetup.meetup_id)
        center_lat, center_lon = compute_center(meetup, participants)
        venues = search_real_venues(center_lat, center_lon, meetup.activity_type)
        venues = self.database.save_venues(venues)

        result = self.engine.generateRecommendations(meetup, participants, venues)
        result = self.database.save_result(result)
        return self.result_response(meetup, result)

    def fetchResults(self, event_code):
        event_code = (event_code or "").upper()
        meetup = self.database.get_meetup_by_code(event_code)
        if not meetup:
            raise LookupError("Meetup not found")

        result = self.database.get_latest_result(meetup.meetup_id)
        if not result:
            return self.generatePlan(event_code)
        return self.result_response(meetup, result)

    def fetchMeetup(self, event_code):
        # The frontend mostly wants one combined object, so build that shape here
        event_code = (event_code or "").upper()
        meetup = self.database.get_meetup_by_code(event_code)
        if not meetup:
            raise LookupError("Meetup not found")

        participants = self.database.get_participants(meetup.meetup_id)
        result = self.database.get_latest_result(meetup.meetup_id)
        share_link = self.database.get_share_link(meetup.meetup_id)
        return self.meetup_response(meetup, participants, result, share_link)

    def addParticipantFromData(self, meetup, data):
        # Location text is geocoded unless the caller already supplied coordinates
        location_text = (data.get("location") or data.get("locationText") or "").strip()
        lat = to_float(data.get("lat") or data.get("latitude"))
        lon = to_float(data.get("lon") or data.get("longitude"))
        location_name = data.get("locationName")

        if lat is None or lon is None:
            lat, lon, location_name = geocode_location(location_text)

        participant = Participant(
            meetup_id=meetup.meetup_id,
            name=data.get("name") or "Anonymous",
            role=data.get("role") or "participant",
            location_text=location_text,
            location_name=location_name,
            latitude=lat,
            longitude=lon,
            budget_preference=data.get("budgetPreference") or data.get("budget") or "",
            activity_preference=data.get("activityPreference") or data.get("activityType") or "",
            indoor_outdoor=data.get("indoorOutdoor") or "Any",
            created_at=data.get("createdAt"),
        )
        return self.database.add_participant(participant)

    def meetup_response(self, meetup, participants, result, share_link=None):
        # Keep the old response fields and add the SDD result fields beside them
        data = meetup.to_dict()
        data["message"] = "Meetup loaded successfully"
        data["participants"] = [participant.to_dict() for participant in participants]
        data["shareLink"] = share_link or {}

        if result and result.ranked_venues:
            top_item = result.ranked_venues[0]
            top_venue = top_item.venue.to_dict()
            data["bestPlace"] = {
                "name": top_venue.get("name"),
                "address": top_venue.get("address"),
                "lat": top_venue.get("lat"),
                "lon": top_venue.get("lon"),
            }
            data["mapLocation"] = data["bestPlace"]
            data["summary"] = {
                "fairnessScore": round(top_item.final_score),
                "avgDistance": round(top_item.avg_distance, 1),
                "maxDistance": round(top_item.max_distance, 1),
                "matchedPreferences": top_item.matched_preferences,
                "explanation": top_item.reason_text,
            }
            data["recommendations"] = [item.to_dict() for item in result.ranked_venues]
            data["result"] = result.to_dict()
        else:
            data["bestPlace"] = {
                "name": meetup.preferred_area_name or meetup.preferred_area or "Suggested Meetup Center",
                "lat": meetup.preferred_lat,
                "lon": meetup.preferred_lon,
            }
            data["mapLocation"] = data["bestPlace"]
            data["summary"] = None
            data["recommendations"] = []
            data["result"] = None

        return data

    def result_response(self, meetup, result):
        return {
            "eventCode": meetup.event_code,
            "meetupId": meetup.meetup_id,
            "result": result.to_dict(),
            "recommendations": [item.to_dict() for item in result.ranked_venues],
        }

    def make_event_code(self):
        alphabet = string.ascii_uppercase + string.digits
        while True:
            code = "".join(random.choice(alphabet) for _ in range(6))
            if not self.database.get_meetup_by_code(code):
                return code

    def make_share_uri(self, base_url, event_code):
        if not base_url:
            return f"/join/{event_code}"
        return f"{base_url.rstrip('/')}/join/{event_code}"
