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
                    type = 'button'
                }) {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default Button;