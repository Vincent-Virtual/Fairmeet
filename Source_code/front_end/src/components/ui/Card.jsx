// src/components/ui/Card.jsx
import './Card.css';

/**
 * Feature Card Component (Function Component)
 * Used to display features on landing page
 * @param {string} icon - Icon placeholder
 * @param {string} title - Card title
 * @param {string} description - Card description
 */
function Card({ icon, title, description }) {
    return (
        <div className="feature-card">
            {/* Icon placeholder */}
            <div className="feature-icon">
                {icon || <div className="icon-placeholder"></div>}
            </div>

            {/* Card content */}
            <h3 className="feature-title">{title}</h3>
            <p className="feature-description">{description}</p>
        </div>
    );
}

export default Card;