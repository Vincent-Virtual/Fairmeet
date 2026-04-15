// src/components/ui/ToggleButton.jsx
import './ToggleButton.css';

/**
 * ToggleButton Component (Function Component)
 * Used for Indoor/Outdoor/Any selection
 * @param {Array} options - Array of option strings ['Indoor', 'Outdoor', 'Any']
 * @param {string} selected - Currently selected option
 * @param {function} onSelect - Selection handler
 * @param {string} label - Label for the toggle group
 * @param {string} className - Additional CSS classes
 */
function ToggleButton({
                          options = [],
                          selected,
                          onSelect,
                          label,
                          className = ''
                      }) {
    return (
        <div className={`toggle-button-group ${className}`}>
            {/* Label */}
            {label && <label className="toggle-label">{label}</label>}

            {/* Toggle buttons */}
            <div className="toggle-buttons">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        className={`toggle-btn ${selected === option ? 'active' : ''}`}
                        onClick={() => onSelect(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default ToggleButton;