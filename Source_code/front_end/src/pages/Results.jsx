// src/pages/Results.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapIcon,
    ArrowPathIcon,
    ShareIcon,
    PlusCircleIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import VenueCard from '../components/VenueCard';
import ParticipantCard from '../components/ParticipantCard';
import Button from '../components/ui/Button';
import './Results.css';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function Results() {
    const { eventCode } = useParams();
    const navigate = useNavigate();

    const [meetupData, setMeetupData] = useState(null);
    const [showAllVenues, setShowAllVenues] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchMeetup = async () => {
            try {
                const response = await fetch(`/api/meetup/${eventCode}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch meetup");
                }

                setMeetupData(data);
                setError('');
            } catch (err) {
                console.error("Failed to load meetup:", err);
                setError(err.message || "Failed to load meetup");
            } finally {
                setLoading(false);
            }
        };

        fetchMeetup();

        const interval = setInterval(fetchMeetup, 3000);

        return () => clearInterval(interval);
    }, [eventCode]);

    const mapLocation = meetupData?.bestPlace || meetupData?.mapLocation;
    const participants = meetupData?.participants || [];
    const summary = meetupData?.summary;
    const recommendations = meetupData?.recommendations || meetupData?.result?.items || [];
    const venuesToDisplay = showAllVenues ? recommendations : recommendations.slice(0, 3);

    const handleRecalculate = async () => {
        try {
            const response = await fetch('/api/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventCode })
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to recalculate');
            }

            const meetupResponse = await fetch(`/api/meetup/${eventCode}`);
            const meetup = await meetupResponse.json();

            if (!meetupResponse.ok) {
                throw new Error(meetup.error || 'Failed to load meetup');
            }

            setMeetupData(meetup);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to recalculate');
        }
    };

    const handleShareResults = () => {
        const shareUrl = `${window.location.origin}/results/${eventCode}`;
        navigator.clipboard.writeText(shareUrl);
        alert('Results link copied to clipboard!');
    };

    const handleNewMeetup = () => {
        navigate('/');
    };

    return (
        <div className="results-page">
            <Header />

            <main className="results-main">
                <div className="results-container">

                    {/* Page header */}
                    <div className="results-header">
                        <h1 className="results-title">Recommended Venues</h1>
                        <p className="results-subtitle">
                            Based on fairness calculation for all {meetupData?.participants?.length || 0} participants
                        </p>
                    </div>

                    {/* Main content grid: Map (left) + Venues (right) */}
                    <div className="results-grid">

                        {/* Left column - Map section */}
                        <div className="map-section">
                            <div className="map-header">
                                <MapIcon className="map-header-icon" />
                                <span className="map-title">Map View</span>
                            </div>

                            <div className="map-placeholder" style={{ height: "320px" }}>
                                {mapLocation && mapLocation.lat && mapLocation.lon ? (
                                    <MapContainer
                                        key={`${mapLocation.lat}-${mapLocation.lon}`}
                                        center={[mapLocation.lat, mapLocation.lon]}
                                        zoom={13}
                                        scrollWheelZoom={false}
                                        style={{ height: "100%", width: "100%" }}
                                    >
                                        <TileLayer
                                            attribution="&copy; OpenStreetMap contributors"
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />

                                        {/* Best place marker */}
                                        <Marker position={[mapLocation.lat, mapLocation.lon]}>
                                            <Popup>
                                                {mapLocation.name || "Suggested Meetup Place"}
                                            </Popup>
                                        </Marker>

                                        {/* Participant markers */}
                                        {participants.map((participant, index) => (
                                            participant.lat != null && participant.lon != null ? (
                                                <Marker
                                                    key={participant.id || `${participant.name}-${index}`}
                                                    position={[participant.lat, participant.lon]}
                                                >
                                                    <Popup>
                                                        <strong>{participant.name || 'Participant'}</strong>
                                                        <br />
                                                        {participant.location || participant.locationName || 'Unknown location'}
                                                    </Popup>
                                                </Marker>
                                            ) : null
                                        ))}
                                    </MapContainer>
                                ) : (
                                    <div className="map-placeholder-content">
                                        <MapIcon className="map-placeholder-icon" />
                                        <p className="map-placeholder-text">
                                            {loading ? "Loading map..." : "No location selected"}
                                        </p>
                                        {error && (
                                            <p className="map-placeholder-subtext">{error}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="map-legend">
                                <h4 className="legend-title">Legend</h4>
                                <div className="legend-items">
                                    <div className="legend-item">
                                        <div className="legend-color participant-color"></div>
                                        <span>Participants</span>
                                    </div>
                                    <div className="legend-item">
                                        <div className="legend-color venue-color"></div>
                                        <span>Venues</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column - Venues list */}
                        <div className="venues-section">
                            {venuesToDisplay.length > 0 ? (
                                venuesToDisplay.map((venue) => (
                                    <VenueCard
                                        key={venue.itemId || `${venue.rank}-${venue.name}`}
                                        rank={venue.rank}
                                        name={venue.name}
                                        address={venue.address || meetupData?.preferredArea || 'Greater Boston area'}
                                        fairnessScore={venue.fairnessScore}
                                        avgDistance={venue.avgDistance}
                                        maxDistance={venue.maxDistance}
                                        matchedPreferences={venue.matchedPreferences || []}
                                        explanation={venue.explanation}
                                    />
                                ))
                            ) : summary ? (
                                <VenueCard
                                    rank={1}
                                    name={mapLocation?.name || 'Suggested Meetup Center'}
                                    address={mapLocation?.address || meetupData?.preferredArea || 'Greater Boston area'}
                                    fairnessScore={summary.fairnessScore}
                                    avgDistance={summary.avgDistance}
                                    maxDistance={summary.maxDistance}
                                    matchedPreferences={summary.matchedPreferences || []}
                                    explanation={summary.explanation}
                                />
                            ) : (
                                <div className="no-participants">
                                    <p>No computed venue summary yet.</p>
                                </div>
                            )}

                            {recommendations.length > 3 && (
                                <div className="show-more-section">
                                    <button
                                        className="show-more-btn"
                                        onClick={() => setShowAllVenues(!showAllVenues)}
                                    >
                                        {showAllVenues
                                            ? `Showing ${recommendations.length} results • Show less`
                                            : `Showing top 3 results • Show all`
                                        }
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action buttons - Avec icônes au lieu d'emojis */}
                    <div className="results-actions">
                        <Button
                            variant="primary"
                            onClick={handleRecalculate}
                            className="action-btn"
                        >
                            <ArrowPathIcon className="btn-icon-inline" />
                            Recalculate
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleShareResults}
                            className="action-btn"
                        >
                            <ShareIcon className="btn-icon-inline" />
                            Share Results
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleNewMeetup}
                            className="action-btn"
                        >
                            <PlusCircleIcon className="btn-icon-inline" />
                            New Meetup
                        </Button>
                    </div>

                    {/* Participants section */}
                    <div className="participants-section">
                        <h2 className="participants-title">Participants in this Meetup</h2>
                        <div className="participants-grid">
                            {meetupData?.participants?.map((participant) => (
                                <ParticipantCard
                                    // key={participant.id}
                                    key={participant.id || `${participant.name}-${participant.location || ''}`}
                                    name={participant.name}
                                    location={participant.location}
                                />
                            ))}

                            {(!meetupData?.participants || meetupData.participants.length === 0) && (
                                <div className="no-participants">
                                    <p>No participants have joined yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer note */}
                    <div className="results-footer">
                        <p className="footer-note">
                            FairMeet — Results are based on distance calculations and preference matching
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Results;
