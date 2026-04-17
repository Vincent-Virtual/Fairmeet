// src/components/ui/Button.jsx
import './Button.css';

/**
 * Reusable Button Component (Function Component)
 * @param {string} variant - 'primary' or 'secondary'
 * @param {string} size - 'small', 'medium', or 'large'
 * @param {function} onClick - Click handler
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Disabled state
 * @param {string} type - Button type (button, submit, reset)
 */
function Button({
                     variant = 'primary',
                     size = 'medium',
                     onClick,
                     children,
                     className = '',
                     disabled = false,
                     type = 'button',
                     loading = false
                 }) {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
        >
            <span className="btn-content">{children}</span>
        </button>
    );
}

export default Button;
