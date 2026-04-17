CREATE TABLE IF NOT EXISTS meetups (
    meetup_id SERIAL PRIMARY KEY,
    event_code VARCHAR(40) UNIQUE NOT NULL,
    title TEXT,
    preferred_area TEXT,
    budget_level VARCHAR(20),
    activity_type VARCHAR(80),
    indoor_outdoor VARCHAR(40),
    preferred_lat DOUBLE PRECISION,
    preferred_lon DOUBLE PRECISION,
    preferred_area_name TEXT,
    status VARCHAR(40) DEFAULT 'created',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participants (
    participant_id SERIAL PRIMARY KEY,
    meetup_id INTEGER NOT NULL REFERENCES meetups(meetup_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role VARCHAR(40) DEFAULT 'participant',
    location_text TEXT,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    budget_preference VARCHAR(20),
    activity_preference VARCHAR(80),
    indoor_outdoor VARCHAR(40),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venues (
    venue_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    category VARCHAR(80),
    price_level VARCHAR(20),
    source VARCHAR(80) DEFAULT 'local',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendation_results (
    result_id SERIAL PRIMARY KEY,
    meetup_id INTEGER NOT NULL REFERENCES meetups(meetup_id) ON DELETE CASCADE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(40) DEFAULT 'generated'
);

CREATE TABLE IF NOT EXISTS recommendation_items (
    item_id SERIAL PRIMARY KEY,
    result_id INTEGER NOT NULL REFERENCES recommendation_results(result_id) ON DELETE CASCADE,
    venue_id INTEGER NOT NULL REFERENCES venues(venue_id),
    rank_no INTEGER NOT NULL,
    final_score DOUBLE PRECISION,
    avg_distance DOUBLE PRECISION,
    max_distance DOUBLE PRECISION,
    matched_preferences TEXT,
    reason_text TEXT
);

CREATE TABLE IF NOT EXISTS share_links (
    link_id SERIAL PRIMARY KEY,
    meetup_id INTEGER NOT NULL REFERENCES meetups(meetup_id) ON DELETE CASCADE,
    share_token VARCHAR(80) UNIQUE NOT NULL,
    share_uri TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_participants_meetup_id ON participants(meetup_id);
CREATE INDEX IF NOT EXISTS idx_results_meetup_id ON recommendation_results(meetup_id);
CREATE INDEX IF NOT EXISTS idx_items_result_id ON recommendation_items(result_id);
