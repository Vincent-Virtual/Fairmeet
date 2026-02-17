// src/components/ui/Select.jsx
import './Select.css';

/**
 * Reusable Select Component (Function Component)
 * @param {string} label - Select label text
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {Array} options - Array of options [{value, label}]
 * @param {boolean} required - Is field required
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Additional CSS classes
 */
function Select({
                    label,
                    value,
                    onChange,
                    options = [],
                    required = false,
                    placeholder = 'Select an option',
                    className = '',
                    name
                }) {
    return (
        <div className={`select-group ${className}`}>
            {/* Label with optional required indicator */}
            {label && (
                <label className="select-label">
                    {label} {required && <span className="required-indicator">*</span>}
                </label>
            )}

            {/* Select dropdown */}
            <select
                className="select-field"
                value={value}
                onChange={onChange}
                required={required}
                name={name}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Select;