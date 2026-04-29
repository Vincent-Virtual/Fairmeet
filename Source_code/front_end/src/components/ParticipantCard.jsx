// src/components/ParticipantCard.jsx
import './ParticipantCard.css';

/**
 * ParticipantCard Component (Function Component)
 * Displays a single participant's information
 * @param {string} name - Participant name
 * @param {string} location - Participant location/address
 * @param {string} avatar - Optional avatar (placeholder for now)
 */
function ParticipantCard({ name, location, avatar, selected = false, onClick }) {
    const displayName = name || 'Participant';
    const displayLocation = location || 'Location not set';
    const cardClassName = [
        'participant-card',
        onClick ? 'participant-card-clickable' : '',
        selected ? 'participant-card-selected' : ''
    ].filter(Boolean).join(' ');

    const handleKeyDown = (event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <div
            className={cardClassName}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-pressed={onClick ? selected : undefined}
        >
            {/* Avatar placeholder */}
            <div className="participant-avatar">
                {avatar || displayName.charAt(0).toUpperCase()}
            </div>

            {/* Participant info */}
            <div className="participant-info">
                <h4 className="participant-name">{displayName}</h4>
                <p className="participant-location">{displayLocation}</p>
            </div>
        </div>
    );
}

export default ParticipantCard;
