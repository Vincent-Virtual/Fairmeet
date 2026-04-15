// src/components/ParticipantCard.jsx
import './ParticipantCard.css';

/**
 * ParticipantCard Component (Function Component)
 * Displays a single participant's information
 * @param {string} name - Participant name
 * @param {string} location - Participant location/address
 * @param {string} avatar - Optional avatar (placeholder for now)
 */
function ParticipantCard({ name, location, avatar }) {
    return (
        <div className="participant-card">
            {/* Avatar placeholder */}
            <div className="participant-avatar">
                {avatar || name.charAt(0).toUpperCase()}
            </div>

            {/* Participant info */}
            <div className="participant-info">
                <h4 className="participant-name">{name}</h4>
                <p className="participant-location">{location}</p>
            </div>
        </div>
    );
}

export default ParticipantCard;