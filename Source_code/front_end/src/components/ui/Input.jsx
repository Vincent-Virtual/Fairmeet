// src/components/ui/Input.jsx
import './Input.css';

/**
 * Reusable Input Component (Function Component)
 * @param {string} label - Input label text
 * @param {string} type - Input type (text, email, etc.)
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {boolean} required - Is field required
 * @param {string} helperText - Helper text below input
 * @param {string} className - Additional CSS classes
 */
function Input({
                   label,
                   type = 'text',
                   placeholder,
                   value,
                   onChange,
                   required = false,
                   helperText,
                   className = '',
                   name
               }) {
    return (
        <div className={`input-group ${className}`}>
            {/* Label with optional required indicator */}
            {label && (
                <label className="input-label">
                    {label} {required && <span className="required-indicator">*</span>}
                </label>
            )}

            {/* Input field */}
            <input
                type={type}
                className="input-field"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                name={name}
            />

            {/* Helper text */}
            {helperText && <p className="input-helper-text">{helperText}</p>}
        </div>
    );
}

export default Input;