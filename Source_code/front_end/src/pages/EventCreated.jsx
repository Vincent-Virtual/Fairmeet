// src/pages/EventCreated.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import './EventCreated.css';

/**
 * EventCreated Page Component (Function Component)
 * Displays the generated event code and sharing options
 */
function EventCreated() {
    const { eventCode } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [meetupData, setMeetupData] = useState(null);

    // Load meetup data from localStorage
    useEffect(() => {
        const data = localStorage.getItem(`meetup_${eventCode}`);
        if (data) {
            setMeetupData(JSON.parse(data));
        }
    }, [eventCode]);

    // Copy event code to clipboard
    const handleCopyCode = () => {
        navigator.clipboard.writeText(eventCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Copy share link to clipboard
    const handleCopyLink = () => {
        const shareLink = `${window.location.origin}/join/${eventCode}`;
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Navigate to results (for testing)
    const handleViewResults = () => {
        navigate(`/results/${eventCode}`);
    };

    // Go back to home
    const handleNewMeetup = () => {
        navigate('/');
    };

    return (
        <div className="event-created-page">
            <Header />

            <main className="event-created-main">
                <div className="event-created-container">
                    {/* Success icon */}
                    <div className="success-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#2d2d2d" strokeWidth="2"/>
                            <path d="M8 12l2 2 4-4" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>

                    {/* Success message */}
                    <h1 className="success-title">Meetup Created!</h1>
                    <p className="success-subtitle">
                        Share this code with participants so they can join
                    </p>

                    {/* Event code display */}
                    <div className="event-code-section">
                        <label className="code-label">Event Code</label>
                        <div className="code-display">
                            <span className="code-text">{eventCode}</span>
                            <button className="copy-button" onClick={handleCopyCode}>
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Meetup details */}
                    {meetupData && (
                        <div className="meetup-details">
                            <h3>Meetup Details:</h3>
                            {meetupData.meetupName && <p><strong>Name:</strong> {meetupData.meetupName}</p>}
                            <p><strong>Activity:</strong> {meetupData.activityType}</p>
                            {meetupData.budget && <p><strong>Budget:</strong> {meetupData.budget}</p>}
                            <p><strong>Preference:</strong> {meetupData.indoorOutdoor}</p>
                        </div>
                    )}

                    {/* Share link */}
                    <div className="share-section">
                        <p className="share-label">Or share this link:</p>
                        <div className="share-link-container">
                            <input
                                type="text"
                                className="share-link-input"
                                value={`${window.location.origin}/join/${eventCode}`}
                                readOnly
                            />
                            <button className="share-button" onClick={handleCopyLink}>
                                Copy Link
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="event-actions">
                        <Button variant="primary" size="large" onClick={handleViewResults}>
                            Join as a Participant
                        </Button>
                        <Button variant="secondary" size="large" onClick={handleNewMeetup}>
                            Create New Meetup
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default EventCreated;