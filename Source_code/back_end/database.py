import os

from models import Meetup, Participant, RecommendationItem, RecommendationResult, Venue


class MemoryDatabase:
    def __init__(self):
        # Handy for quick local runs when PostgreSQL is not running yet
        self.meetups = {}
        self.participants = {}
        self.venues = {}
        self.results = {}
        self.result_items = {}
        self.share_links = {}
        self.next_meetup_id = 1
        self.next_participant_id = 1
        self.next_venue_id = 1
        self.next_result_id = 1
        self.next_item_id = 1

    def init_schema(self):
        return None

    def create_meetup(self, meetup, share_uri=None):
        if meetup.event_code in self.meetups:
            meetup.meetup_id = self.meetups[meetup.event_code].meetup_id
        else:
            meetup.meetup_id = self.next_meetup_id
            self.next_meetup_id += 1

        self.meetups[meetup.event_code] = meetup
        self.share_links[meetup.meetup_id] = {
            "shareToken": meetup.event_code,
            "shareUri": share_uri or "",
        }
        return meetup

    def get_meetup_by_code(self, event_code):
        return self.meetups.get(event_code)

    def add_participant(self, participant):
        participant.participant_id = self.next_participant_id
        self.next_participant_id += 1
        self.participants[participant.participant_id] = participant
        return participant

    def get_participants(self, meetup_id):
        return [
            participant
            for participant in self.participants.values()
            if participant.meetup_id == meetup_id
        ]

    def save_venues(self, venues):
        saved = []
        for venue in venues:
            existing = self.find_venue(venue)
            if existing:
                saved.append(existing)
                continue

            venue.venue_id = self.next_venue_id
            self.next_venue_id += 1
            self.venues[venue.venue_id] = venue
            saved.append(venue)
        return saved

    def find_venue(self, venue):
        for existing in self.venues.values():
            if (
                existing.name == venue.name
                and round(existing.latitude or 0, 5) == round(venue.latitude or 0, 5)
                and round(existing.longitude or 0, 5) == round(venue.longitude or 0, 5)
            ):
                return existing
        return None

    def save_result(self, result):
        result.recommendation_id = self.next_result_id
        self.next_result_id += 1
        self.results[result.recommendation_id] = result

        for item in result.ranked_venues:
            item.result_id = result.recommendation_id
            item.item_id = self.next_item_id
            self.next_item_id += 1
            self.result_items[item.item_id] = item

        return result

    def get_latest_result(self, meetup_id):
        results = [
            result
            for result in self.results.values()
            if result.meetup_id == meetup_id
        ]
        if not results:
            return None
        return sorted(results, key=lambda result: result.recommendation_id)[-1]

    def get_share_link(self, meetup_id):
        return self.share_links.get(meetup_id, {})


class PostgresDatabase:
    def __init__(self, database_url):
        self.database_url = database_url

    def connect(self):
        # Imported here so memory mode can run even before psycopg2 is installed
        import psycopg2
        import psycopg2.extras

        return psycopg2.connect(
            self.database_url,
            cursor_factory=psycopg2.extras.RealDictCursor,
        )

    def init_schema(self):
        # The schema file is small, so running it at startup keeps setup simple
        schema_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")
        with open(schema_path, "r", encoding="utf-8") as schema_file:
            schema_sql = schema_file.read()

        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute(schema_sql)

    def create_meetup(self, meetup, share_uri=None):
        sql = """
            INSERT INTO meetups (
                event_code, title, preferred_area, budget_level, activity_type,
                indoor_outdoor, preferred_lat, preferred_lon, preferred_area_name,
                status, created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (event_code) DO UPDATE SET
                title = EXCLUDED.title,
                preferred_area = EXCLUDED.preferred_area,
                budget_level = EXCLUDED.budget_level,
                activity_type = EXCLUDED.activity_type,
                indoor_outdoor = EXCLUDED.indoor_outdoor,
                preferred_lat = EXCLUDED.preferred_lat,
                preferred_lon = EXCLUDED.preferred_lon,
                preferred_area_name = EXCLUDED.preferred_area_name,
                status = EXCLUDED.status
            RETURNING *
        """
        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        meetup.event_code,
                        meetup.title,
                        meetup.preferred_area,
                        meetup.budget_level,
                        meetup.activity_type,
                        meetup.indoor_outdoor,
                        meetup.preferred_lat,
                        meetup.preferred_lon,
                        meetup.preferred_area_name,
                        meetup.status,
                        meetup.created_at,
                    ),
                )
                row = cur.fetchone()
                saved = self.row_to_meetup(row)
                cur.execute(
                    """
                    INSERT INTO share_links (meetup_id, share_token, share_uri)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (share_token) DO UPDATE SET share_uri = EXCLUDED.share_uri
                    """,
                    (saved.meetup_id, saved.event_code, share_uri or ""),
                )
                return saved

    def get_meetup_by_code(self, event_code):
        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM meetups WHERE event_code = %s", (event_code,))
                row = cur.fetchone()
                if not row:
                    return None
                return self.row_to_meetup(row)

    def add_participant(self, participant):
        sql = """
            INSERT INTO participants (
                meetup_id, name, role, location_text, location_name, latitude,
                longitude, budget_preference, activity_preference, indoor_outdoor,
                created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """
        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    sql,
                    (
                        participant.meetup_id,
                        participant.name,
                        participant.role,
                        participant.location_text,
                        participant.location_name,
                        participant.latitude,
                        participant.longitude,
                        participant.budget_preference,
                        participant.activity_preference,
                        participant.indoor_outdoor,
                        participant.created_at,
                    ),
                )
                return self.row_to_participant(cur.fetchone())

    def get_participants(self, meetup_id):
        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT * FROM participants WHERE meetup_id = %s ORDER BY participant_id",
                    (meetup_id,),
                )
                return [self.row_to_participant(row) for row in cur.fetchall()]

    def save_venues(self, venues):
        saved = []
        with self.connect() as conn:
            with conn.cursor() as cur:
                for venue in venues:
                    cur.execute(
                        """
                        SELECT * FROM venues
                        WHERE name = %s
                        AND latitude IS NOT DISTINCT FROM %s
                        AND longitude IS NOT DISTINCT FROM %s
                        LIMIT 1
                        """,
                        (venue.name, venue.latitude, venue.longitude),
                    )
                    row = cur.fetchone()
                    if row:
                        saved.append(self.row_to_venue(row))
                        continue

                    cur.execute(
                        """
                        INSERT INTO venues (
                            name, address, latitude, longitude, category, price_level, source
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING *
                        """,
                        (
                            venue.name,
                            venue.address,
                            venue.latitude,
                            venue.longitude,
                            venue.category,
                            venue.price_level,
                            venue.source,
                        ),
                    )
                    saved.append(self.row_to_venue(cur.fetchone()))
        return saved

    def save_result(self, result):
        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO recommendation_results (meetup_id, generated_at, status)
                    VALUES (%s, %s, %s)
                    RETURNING *
                    """,
                    (result.meetup_id, result.generated_at, result.status),
                )
                result_row = cur.fetchone()
                saved_result = self.row_to_result(result_row)

                # Keep saved item ids on the objects so the response matches the rows
                for item in result.ranked_venues:
                    cur.execute(
                        """
                        INSERT INTO recommendation_items (
                            result_id, venue_id, rank_no, final_score, avg_distance,
                            max_distance, matched_preferences, reason_text
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING *
                        """,
                        (
                            saved_result.recommendation_id,
                            item.venue.venue_id,
                            item.rank_no,
                            item.final_score,
                            item.avg_distance,
                            item.max_distance,
                            ",".join(item.matched_preferences),
                            item.reason_text,
                        ),
                    )
                    item_row = cur.fetchone()
                    item.item_id = item_row["item_id"]
                    item.result_id = saved_result.recommendation_id

                saved_result.ranked_venues = result.ranked_venues
                return saved_result

    def get_latest_result(self, meetup_id):
        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT *
                    FROM recommendation_results
                    WHERE meetup_id = %s
                    ORDER BY generated_at DESC, result_id DESC
                    LIMIT 1
                    """,
                    (meetup_id,),
                )
                result_row = cur.fetchone()
                if not result_row:
                    return None

                result = self.row_to_result(result_row)
                cur.execute(
                    """
                    SELECT
                        ri.*,
                        v.venue_id, v.name, v.address, v.latitude, v.longitude,
                        v.category, v.price_level, v.source
                    FROM recommendation_items ri
                    JOIN venues v ON v.venue_id = ri.venue_id
                    WHERE ri.result_id = %s
                    ORDER BY ri.rank_no
                    """,
                    (result.recommendation_id,),
                )
                result.ranked_venues = [self.row_to_item(row) for row in cur.fetchall()]
                return result

    def get_share_link(self, meetup_id):
        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM share_links WHERE meetup_id = %s", (meetup_id,))
                row = cur.fetchone()
                if not row:
                    return {}
                return {
                    "shareToken": row["share_token"],
                    "shareUri": row["share_uri"],
                }

    def row_to_meetup(self, row):
        return Meetup(
            meetup_id=row["meetup_id"],
            event_code=row["event_code"],
            title=row["title"] or "",
            preferred_area=row["preferred_area"] or "",
            budget_level=row["budget_level"] or "",
            activity_type=row["activity_type"] or "",
            indoor_outdoor=row["indoor_outdoor"] or "Any",
            status=row["status"] or "created",
            created_at=str(row["created_at"]),
            preferred_lat=row["preferred_lat"],
            preferred_lon=row["preferred_lon"],
            preferred_area_name=row["preferred_area_name"],
        )

    def row_to_participant(self, row):
        return Participant(
            participant_id=row["participant_id"],
            meetup_id=row["meetup_id"],
            name=row["name"],
            role=row["role"],
            location_text=row["location_text"] or "",
            location_name=row["location_name"],
            latitude=row["latitude"],
            longitude=row["longitude"],
            budget_preference=row["budget_preference"] or "",
            activity_preference=row["activity_preference"] or "",
            indoor_outdoor=row["indoor_outdoor"] or "Any",
            created_at=str(row["created_at"]),
        )

    def row_to_venue(self, row):
        return Venue(
            venue_id=row["venue_id"],
            name=row["name"],
            address=row["address"] or "",
            latitude=row["latitude"],
            longitude=row["longitude"],
            category=row["category"] or "",
            price_level=row["price_level"] or "",
            source=row["source"] or "local",
        )

    def row_to_result(self, row):
        return RecommendationResult(
            recommendation_id=row["result_id"],
            meetup_id=row["meetup_id"],
            generated_at=str(row["generated_at"]),
            status=row["status"] or "generated",
        )

    def row_to_item(self, row):
        venue = self.row_to_venue(row)
        matched_text = row["matched_preferences"] or ""
        matched = [item for item in matched_text.split(",") if item]
        return RecommendationItem(
            item_id=row["item_id"],
            result_id=row["result_id"],
            venue=venue,
            rank_no=row["rank_no"],
            final_score=row["final_score"] or 0,
            avg_distance=row["avg_distance"] or 0,
            max_distance=row["max_distance"] or 0,
            matched_preferences=matched,
            reason_text=row["reason_text"] or "",
        )


def get_database():
    # Default to PostgreSQL when available, but do not block local preview work
    storage = os.environ.get("FAIRMEET_STORAGE", "auto").lower()
    default_url = "postgresql://postgres:postgres@localhost:5432/fairmeet"
    database_url = os.environ.get("DATABASE_URL", default_url)

    if storage in ("auto", "postgres"):
        try:
            database = PostgresDatabase(database_url)
            database.init_schema()
            print("Using PostgreSQL database")
            return database
        except Exception as exc:
            if storage == "postgres":
                raise
            print("PostgreSQL is not available, using memory database:", exc)

    return MemoryDatabase()
