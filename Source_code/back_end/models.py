from datetime import datetime


def now_text():
    return datetime.utcnow().isoformat()


class Meetup:
    def __init__(
        self,
        meetup_id=None,
        event_code="",
        title="",
        preferred_area="",
        budget_level="",
        activity_type="",
        indoor_outdoor="Any",
        status="created",
        created_at=None,
        preferred_lat=None,
        preferred_lon=None,
        preferred_area_name=None,
    ):
        self.meetup_id = meetup_id
        self.event_code = event_code
        self.title = title
        self.preferred_area = preferred_area
        self.budget_level = budget_level
        self.activity_type = activity_type
        self.indoor_outdoor = indoor_outdoor or "Any"
        self.status = status
        self.created_at = created_at or now_text()
        self.preferred_lat = preferred_lat
        self.preferred_lon = preferred_lon
        self.preferred_area_name = preferred_area_name
        self.participants = []
        self.results = []

    def createMeetup(self):
        self.status = "created"
        return self

    def addParticipant(self, participant):
        self.participants.append(participant)

    def getParticipants(self):
        return self.participants

    def getResults(self):
        return self.results

    def to_dict(self):
        return {
            "meetupId": self.meetup_id,
            "eventCode": self.event_code,
            "meetupName": self.title,
            "title": self.title,
            "preferredArea": self.preferred_area,
            "budget": self.budget_level,
            "budgetLevel": self.budget_level,
            "activityType": self.activity_type,
            "indoorOutdoor": self.indoor_outdoor,
            "status": self.status,
            "createdAt": self.created_at,
            "preferredAreaLat": self.preferred_lat,
            "preferredAreaLon": self.preferred_lon,
            "preferredAreaName": self.preferred_area_name,
        }


class Participant:
    def __init__(
        self,
        participant_id=None,
        meetup_id=None,
        name="Anonymous",
        role="participant",
        location_text="",
        location_name=None,
        latitude=None,
        longitude=None,
        budget_preference="",
        activity_preference="",
        indoor_outdoor="Any",
        created_at=None,
    ):
        self.participant_id = participant_id
        self.meetup_id = meetup_id
        self.name = name or "Anonymous"
        self.role = role or "participant"
        self.location_text = location_text
        self.location_name = location_name
        self.latitude = latitude
        self.longitude = longitude
        self.budget_preference = budget_preference
        self.activity_preference = activity_preference
        self.indoor_outdoor = indoor_outdoor or "Any"
        self.created_at = created_at or now_text()

    def validateLocation(self):
        return self.latitude is not None and self.longitude is not None

    def validatePreferences(self):
        return bool(self.budget_preference or self.activity_preference or self.indoor_outdoor)

    def to_dict(self):
        return {
            "id": self.participant_id,
            "participantId": self.participant_id,
            "meetupId": self.meetup_id,
            "name": self.name,
            "role": self.role,
            "location": self.location_text,
            "locationText": self.location_text,
            "locationName": self.location_name,
            "lat": self.latitude,
            "lon": self.longitude,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "budgetPreference": self.budget_preference,
            "activityPreference": self.activity_preference,
            "indoorOutdoor": self.indoor_outdoor,
            "createdAt": self.created_at,
        }


class Venue:
    def __init__(
        self,
        venue_id=None,
        name="",
        address="",
        latitude=None,
        longitude=None,
        category="",
        price_level="",
        source="local",
    ):
        self.venue_id = venue_id
        self.name = name
        self.address = address
        self.latitude = latitude
        self.longitude = longitude
        self.category = category
        self.price_level = price_level
        self.source = source

    def matchesBudget(self, budget_level):
        if not budget_level or not self.price_level:
            return True
        return len(self.price_level) <= len(budget_level)

    def matchesActivity(self, activity_type):
        if not activity_type or not self.category:
            return True

        activity = activity_type.lower()
        category = self.category.lower()
        matches = {
            "coffee": ["cafe", "coffee"],
            "food": ["restaurant", "food"],
            "drinks": ["bar", "pub", "drinks"],
            "study": ["library", "cafe", "study"],
            "entertainment": ["cinema", "theatre", "entertainment"],
        }
        return category in matches.get(activity, [activity])

    def to_dict(self):
        return {
            "venueId": self.venue_id,
            "name": self.name,
            "address": self.address,
            "lat": self.latitude,
            "lon": self.longitude,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "category": self.category,
            "priceLevel": self.price_level,
            "source": self.source,
        }


class RecommendationItem:
    def __init__(
        self,
        item_id=None,
        result_id=None,
        venue=None,
        rank_no=1,
        final_score=0,
        avg_distance=0,
        max_distance=0,
        matched_preferences=None,
        reason_text="",
    ):
        self.item_id = item_id
        self.result_id = result_id
        self.venue = venue
        self.rank_no = rank_no
        self.final_score = final_score
        self.avg_distance = avg_distance
        self.max_distance = max_distance
        self.matched_preferences = matched_preferences or []
        self.reason_text = reason_text

    def to_dict(self):
        venue_data = self.venue.to_dict() if self.venue else {}
        return {
            "itemId": self.item_id,
            "resultId": self.result_id,
            "rank": self.rank_no,
            "name": venue_data.get("name"),
            "address": venue_data.get("address"),
            "lat": venue_data.get("lat"),
            "lon": venue_data.get("lon"),
            "coordinates": {
                "lat": venue_data.get("lat"),
                "lng": venue_data.get("lon"),
            },
            "venue": venue_data,
            "fairnessScore": round(self.final_score),
            "finalScore": round(self.final_score, 1),
            "avgDistance": round(self.avg_distance, 1),
            "maxDistance": round(self.max_distance, 1),
            "matchedPreferences": self.matched_preferences,
            "explanation": self.reason_text,
            "reasonText": self.reason_text,
        }


class RecommendationResult:
    def __init__(
        self,
        recommendation_id=None,
        meetup_id=None,
        ranked_venues=None,
        generated_at=None,
        status="generated",
    ):
        self.recommendation_id = recommendation_id
        self.meetup_id = meetup_id
        self.ranked_venues = ranked_venues or []
        self.generated_at = generated_at or now_text()
        self.status = status

    def getTopVenues(self, count=3):
        return self.ranked_venues[:count]

    def saveResults(self):
        return self

    def to_dict(self):
        return {
            "recommendationId": self.recommendation_id,
            "resultId": self.recommendation_id,
            "meetupId": self.meetup_id,
            "generatedAt": self.generated_at,
            "status": self.status,
            "items": [item.to_dict() for item in self.ranked_venues],
            "rankedVenues": [item.to_dict() for item in self.ranked_venues],
        }
