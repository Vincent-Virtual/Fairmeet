// src/components/VenueCard.jsx
import './VenueCard.css';

/**
 * VenueCard Component (Function Component)
 * Displays a single recommended venue with all details
 * @param {number} rank - Venue ranking number (#1, #2, etc.)
 * @param {string} name - Venue name
 * @param {string} address - Venue address
 * @param {number} fairnessScore - Fairness score (0-100)
 * @param {number} avgDistance - Average distance in miles
 * @param {number} maxDistance - Maximum distance in miles
 * @param {Array} matchedPreferences - Array of matched preference tags
 * @param {string} explanation - Why this venue was selected
 */
function VenueCard({
                        rank,
                        name,
                        address,
                        fairnessScore,
                        avgDistance,
                        maxDistance,
                        matchedPreferences = [],
                        explanation,
                        selected = false,
                        onSelect,
                        onNavigate
                    }) {
    return (
        <div
            id={`venue-card-${rank}`}
            className={`venue-card ${selected ? 'venue-card-selected' : ''}`}
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect?.();
                }
            }}
        >
            {/* Header with rank and name */}
            <div className="venue-header">
                <div className="venue-rank">#{rank}</div>
                <div className="venue-info">
                    <h3 className="venue-name">{name}</h3>
                    <p className="venue-address">{address}</p>
                </div>
                <div className="fairness-score">{fairnessScore}</div>
                <span className="score-label">Fairness</span>
            </div>

            {/* Distance Fairness Summary */}
            <div className="distance-summary">
                <h4 className="section-title">Distance Fairness Summary</h4>
                <div className="distance-stats">
                    <div className="distance-stat">
                        <div className="stat-icon">⊙</div>
                        <div className="stat-content">
                            <span className="stat-label">Avg Distance</span>
                            <span className="stat-value">{avgDistance} mi</span>
                        </div>
                    </div>
                    <div className="distance-stat">
                        <div className="stat-icon">◉</div>
                        <div className="stat-content">
                            <span className="stat-label">Max Distance</span>
                            <span className="stat-value">{maxDistance} mi</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matched Preferences */}
            <div className="matched-preferences">
                <h4 className="section-title">Matched Preferences</h4>
                <div className="preference-tags">
                    {matchedPreferences.map((pref, index) => (
                        <span key={index} className="preference-tag">
              {pref}
            </span>
                    ))}
                </div>
            </div>

            {/* Explanation */}
            <div className="venue-explanation">
                <h4 className="section-title">Why this venue?</h4>
                <p className="explanation-text">{explanation}</p>
            </div>

            <button
                type="button"
                className="venue-map-link"
                onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.();
                }}
            >
                Open in Google Maps
            </button>
        </div>
    );
}

export default VenueCard;
