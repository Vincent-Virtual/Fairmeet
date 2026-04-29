// src/pages/Results.jsx
import { useEffect, useRef, useState } from 'react';
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

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

const defaultCenter = [42.3601, -71.0589];

function venueIcon(rank, selected) {
    return L.divIcon({
        className: '',
        html: `<div class="venue-map-marker ${selected ? 'venue-map-marker-selected' : ''}">${rank}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
    });
}

const participantIcon = L.divIcon({
    className: '',
    html: '<div class="self-map-marker"><span></span></div>',
    iconSize: [32, 34],
    iconAnchor: [16, 30],
    popupAnchor: [0, -26]
});

const selectedParticipantIcon = L.divIcon({
    className: '',
    html: '<div class="selected-participant-map-marker"><span></span></div>',
    iconSize: [32, 34],
    iconAnchor: [16, 30],
    popupAnchor: [0, -26]
});

function MapController({ points, selectedVenue, selectedParticipant }) {
    const map = useMap();
    const didFit = useRef(false);

    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 80);
        return () => clearTimeout(timer);
    }, [map]);

    useEffect(() => {
        const validPoints = points.filter((point) => point.lat != null && point.lon != null);
        if (!didFit.current && validPoints.length > 0) {
            if (validPoints.length === 1) {
                map.setView([validPoints[0].lat, validPoints[0].lon], 14);
            } else {
                const bounds = L.latLngBounds(validPoints.map((point) => [point.lat, point.lon]));
                map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
            }
            didFit.current = true;
        }
    }, [map, points]);

    useEffect(() => {
        if (selectedVenue?.lat != null && selectedVenue?.lon != null) {
            map.flyTo([selectedVenue.lat, selectedVenue.lon], Math.max(map.getZoom(), 14), {
                duration: 0.4
            });
        }
    }, [map, selectedVenue?.rank, selectedVenue?.lat, selectedVenue?.lon]);

    useEffect(() => {
        if (selectedParticipant?.lat != null && selectedParticipant?.lon != null) {
            map.flyTo([selectedParticipant.lat, selectedParticipant.lon], Math.max(map.getZoom(), 14), {
                duration: 0.4
            });
        }
    }, [map, selectedParticipant?.id, selectedParticipant?.lat, selectedParticipant?.lon]);

    return null;
}

function Results() {
    const { eventCode } = useParams();
    const navigate = useNavigate();

    const [meetupData, setMeetupData] = useState(null);
    const [showAllVenues, setShowAllVenues] = useState(false);
    const [selectedRank, setSelectedRank] = useState(null);
    const [selectedParticipantId, setSelectedParticipantId] = useState(null);
    const [activePopupRank, setActivePopupRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);
    const [error, setError] = useState('');
    const markerRefs = useRef({});
    const participantMarkerRef = useRef(null);

    useEffect(() => {
        const fetchMeetup = async () => {
            try {
                const response = await fetch(`/api/meetup/${eventCode}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch meetup');
                }

                setMeetupData(data);
                setError('');
            } catch (err) {
                console.error('Failed to load meetup:', err);
                setError(err.message || 'Failed to load meetup');
            } finally {
                setLoading(false);
            }
        };

        fetchMeetup();

        const interval = setInterval(fetchMeetup, 3000);

        return () => clearInterval(interval);
    }, [eventCode]);

    const participants = meetupData?.participants || [];
    const summary = meetupData?.summary;
    const recommendations = meetupData?.recommendations || meetupData?.result?.items || [];
    const venuesToDisplay = showAllVenues ? recommendations : recommendations.slice(0, 3);
    const ownerLocationText = sessionStorage.getItem(`fairmeet_owner_location_${eventCode}`);
    const ownerLocation = ownerLocationText ? JSON.parse(ownerLocationText) : null;
    const participantKey = (participant) => String(
        participant?.id || participant?.participantId || `${participant?.name || 'participant'}-${participant?.lat || ''}-${participant?.lon || ''}`
    );
    const hasCreatorParticipant = participants.some((participant) => participant.role === 'creator');
    const visibleParticipants = !hasCreatorParticipant && ownerLocation
        ? [{
            id: 'local-creator',
            participantId: 'local-creator',
            name: 'Creator',
            role: 'creator',
            location: ownerLocation.label,
            locationName: ownerLocation.label,
            lat: ownerLocation.lat,
            lon: ownerLocation.lon
        }, ...participants]
        : participants;

    useEffect(() => {
        if (recommendations.length === 0) {
            setSelectedRank(null);
            return;
        }

        const stillExists = recommendations.some((venue) => venue.rank === selectedRank);
        if (!stillExists) {
            setSelectedRank(recommendations[0].rank);
        }
    }, [recommendations, selectedRank]);

    useEffect(() => {
        if (selectedParticipantId && !visibleParticipants.some((participant) => participantKey(participant) === selectedParticipantId)) {
            setSelectedParticipantId(null);
        }
    }, [visibleParticipants, selectedParticipantId]);

    const selectedVenue = recommendations.find((venue) => venue.rank === selectedRank) || recommendations[0];
    const selectedParticipant = visibleParticipants.find((participant) => participantKey(participant) === selectedParticipantId);
    const selectedParticipantLocation = selectedParticipant?.lat != null && selectedParticipant?.lon != null
        ? {
            id: participantKey(selectedParticipant),
            lat: selectedParticipant.lat,
            lon: selectedParticipant.lon,
            name: selectedParticipant.name || 'Participant',
            label: selectedParticipant.location || selectedParticipant.locationName || 'Selected location'
        }
        : null;
    const viewerParticipantId = sessionStorage.getItem(`fairmeet_participant_${eventCode}`);
    const viewerParticipant = participants.find((participant) => String(participant.id) === String(viewerParticipantId));
    const viewerLocation = viewerParticipant?.lat != null && viewerParticipant?.lon != null
        ? {
            lat: viewerParticipant.lat,
            lon: viewerParticipant.lon,
            label: viewerParticipant.location || viewerParticipant.locationName || 'Your location'
        }
        : ownerLocation;
    const mapCenter = selectedVenue?.lat != null && selectedVenue?.lon != null
        ? [selectedVenue.lat, selectedVenue.lon]
        : defaultCenter;

    const mapPoints = [
        ...recommendations.map((venue) => ({ lat: venue.lat, lon: venue.lon })),
        ...(viewerLocation ? [{ lat: viewerLocation.lat, lon: viewerLocation.lon }] : []),
        ...(selectedParticipantLocation ? [{ lat: selectedParticipantLocation.lat, lon: selectedParticipantLocation.lon }] : [])
    ];
    const hasMapPoints = mapPoints.some((point) => point.lat != null && point.lon != null);

    const openGoogleMaps = (venue) => {
        if (venue?.lat == null || venue?.lon == null) return;

        const params = new URLSearchParams({
            api: '1',
            destination: `${venue.lat},${venue.lon}`,
            travelmode: 'driving'
        });

        if (viewerLocation?.lat != null && viewerLocation?.lon != null) {
            params.set('origin', `${viewerLocation.lat},${viewerLocation.lon}`);
        }

        window.open(`https://www.google.com/maps/dir/?${params.toString()}`, '_blank', 'noopener,noreferrer');
    };

    const selectVenue = (venue, options = {}) => {
        const { shouldScroll = false, fromMap = false } = options;
        setSelectedRank(venue.rank);
        if (venue.rank > 3) {
            setShowAllVenues(true);
        }

        if (!fromMap && activePopupRank != null) {
            setTimeout(() => {
                markerRefs.current[venue.rank]?.openPopup();
            }, 120);
        }

        if (shouldScroll) {
            setTimeout(() => {
                document.getElementById(`venue-card-${venue.rank}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 80);
        }
    };

    const selectParticipant = (participant) => {
        const key = participantKey(participant);
        if (selectedParticipantId === key) {
            setSelectedParticipantId(null);
            participantMarkerRef.current?.closePopup();
            return;
        }

        setSelectedParticipantId(key);
        setTimeout(() => {
            participantMarkerRef.current?.openPopup();
        }, 150);
    };

    const handleRecalculate = async () => {
        try {
            setRecalculating(true);
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
            setSelectedRank(meetup.recommendations?.[0]?.rank || null);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to recalculate');
        } finally {
            setRecalculating(false);
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
                    <div className="results-header">
                        <h1 className="results-title">
                            {meetupData?.meetupName ? `${meetupData.meetupName} Results` : 'Recommended Venues'}
                        </h1>
                        <p className="results-subtitle">
                            Recommended venues based on {meetupData?.activityType || 'meetup'} preferences and {visibleParticipants.length} participants
                        </p>
                    </div>

                    <div className="results-grid">
                        <div className="map-section">
                            <div className="map-header">
                                <MapIcon className="map-header-icon" />
                                <span className="map-title">Map View</span>
                            </div>

                            <div className="map-placeholder">
                                {hasMapPoints ? (
                                    <MapContainer
                                        center={mapCenter}
                                        zoom={13}
                                        scrollWheelZoom={true}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <MapController
                                            points={mapPoints}
                                            selectedVenue={selectedVenue}
                                            selectedParticipant={selectedParticipantLocation}
                                        />
                                        <TileLayer
                                            attribution="&copy; OpenStreetMap contributors"
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />

                                        {recommendations.map((venue) => (
                                            venue.lat != null && venue.lon != null ? (
                                                <Marker
                                                    key={venue.itemId || `${venue.rank}-${venue.name}`}
                                                    ref={(ref) => {
                                                        if (ref) {
                                                            markerRefs.current[venue.rank] = ref;
                                                        } else {
                                                            delete markerRefs.current[venue.rank];
                                                        }
                                                    }}
                                                    position={[venue.lat, venue.lon]}
                                                    icon={venueIcon(venue.rank, venue.rank === selectedRank)}
                                                    eventHandlers={{
                                                        click: () => selectVenue(venue, { shouldScroll: true, fromMap: true }),
                                                        popupopen: () => setActivePopupRank(venue.rank),
                                                        popupclose: () => {
                                                            setActivePopupRank((current) => current === venue.rank ? null : current);
                                                        }
                                                    }}
                                                >
                                                    <Popup>
                                                        <strong>{venue.name}</strong>
                                                        <br />
                                                        {venue.address || 'Greater Boston area'}
                                                        <br />
                                                        <button
                                                            type="button"
                                                            className="map-popup-button"
                                                            onClick={() => openGoogleMaps(venue)}
                                                        >
                                                            Open in Google Maps
                                                        </button>
                                                    </Popup>
                                                </Marker>
                                            ) : null
                                        ))}

                                        {viewerLocation?.lat != null && viewerLocation?.lon != null && (
                                            <Marker
                                                position={[viewerLocation.lat, viewerLocation.lon]}
                                                icon={participantIcon}
                                            >
                                                <Popup>
                                                    <strong>Your location</strong>
                                                    <br />
                                                    {viewerLocation.label || 'Selected location'}
                                                </Popup>
                                            </Marker>
                                        )}

                                        {selectedParticipantLocation && (
                                            <Marker
                                                key={selectedParticipantLocation.id}
                                                ref={participantMarkerRef}
                                                position={[selectedParticipantLocation.lat, selectedParticipantLocation.lon]}
                                                icon={selectedParticipantIcon}
                                            >
                                                <Popup>
                                                    <strong>{selectedParticipantLocation.name}</strong>
                                                    <br />
                                                    {selectedParticipantLocation.label}
                                                </Popup>
                                            </Marker>
                                        )}
                                    </MapContainer>
                                ) : (
                                    <div className="map-placeholder-content">
                                        <MapIcon className="map-placeholder-icon" />
                                        <p className="map-placeholder-text">
                                            {loading ? 'Loading map...' : 'No recommendation locations yet'}
                                        </p>
                                        {error && (
                                            <p className="map-placeholder-subtext">{error}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="map-legend">
                                <h4 className="legend-title">Legend</h4>
                                <div className="legend-items">
                                    <div className="legend-item">
                                        <div className="legend-color venue-color"></div>
                                        <span>Recommended venues</span>
                                    </div>
                                    <div className="legend-item">
                                        <div className="legend-color participant-color"></div>
                                        <span>Your location</span>
                                    </div>
                                    {selectedParticipantLocation && (
                                        <div className="legend-item">
                                            <div className="legend-color selected-participant-color"></div>
                                            <span>Selected participant</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

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
                                        selected={venue.rank === selectedRank}
                                        onSelect={() => selectVenue(venue)}
                                        onNavigate={() => openGoogleMaps(venue)}
                                    />
                                ))
                            ) : summary ? (
                                <VenueCard
                                    rank={1}
                                    name={meetupData?.bestPlace?.name || 'Suggested Meetup Center'}
                                    address={meetupData?.bestPlace?.address || meetupData?.preferredArea || 'Greater Boston area'}
                                    fairnessScore={summary.fairnessScore}
                                    avgDistance={summary.avgDistance}
                                    maxDistance={summary.maxDistance}
                                    matchedPreferences={summary.matchedPreferences || []}
                                    explanation={summary.explanation}
                                    selected
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
                                            ? `Showing ${recommendations.length} results - Show less`
                                            : 'Showing top 3 results - Show all'
                                        }
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="results-actions">
                        <Button
                            variant="primary"
                            onClick={handleRecalculate}
                            className="action-btn"
                            loading={recalculating}
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

                    <div className="participants-section">
                        <h2 className="participants-title">Participants in this Meetup</h2>
                        <div className="participants-grid">
                            {visibleParticipants.map((participant) => (
                                <ParticipantCard
                                    key={participant.id || `${participant.name}-${participant.location || ''}`}
                                    name={participant.name}
                                    location={participant.location}
                                    selected={participantKey(participant) === selectedParticipantId}
                                    onClick={
                                        participant.lat != null && participant.lon != null
                                            ? () => selectParticipant(participant)
                                            : undefined
                                    }
                                />
                            ))}

                            {visibleParticipants.length === 0 && (
                                <div className="no-participants">
                                    <p>No participants have joined yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="results-footer">
                        <p className="footer-note">
                            FairMeet - Results are based on distance calculations and preference matching
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Results;
