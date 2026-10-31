import Link from 'next/link';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    href,
    type = 'button',
    disabled = false,
    loading = false,
    loadingText = 'Guardando…',
    onClick,
    className = '',
    ...props
}) {
    const variantClass =
        variant === 'primary'
            ? 'pulso-btn-primary'
            : variant === 'secondary'
            ? 'pulso-btn-secondary'
            : 'pulso-btn-ghost';

    const sizeClass = size === 'sm' ? 'pulso-btn-sm' : '';
    const classes = `pulso-btn ${variantClass} ${sizeClass} ${className}`.trim();

    if (href && !disabled) {
        return (
            <Link href={href} className={classes} onClick={onClick} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={classes}
            {...props}
        >
            {loading ? loadingText : children}
        </button>
    );
}

export default Button;
