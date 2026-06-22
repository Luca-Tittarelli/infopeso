export function ErrorComponent({ message, onRetry }) {
    return (
        <div
            className="flex flex-col items-center gap-3 py-10 px-6 rounded-xl w-full max-w-sm mx-auto text-center"
            style={{
                background: 'var(--negative-soft)',
                border: '1px solid var(--negative)',
                borderOpacity: 0.3,
            }}
        >
            {/* Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28" height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--negative)' }}
            >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 9v4m0 4h.01" />
                <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
            </svg>

            <div>
                <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--negative)' }}>
                    Error al cargar
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {message || 'No se pudo obtener información'}
                </p>
            </div>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                        background: 'var(--negative)',
                        color: 'white',
                    }}
                >
                    Reintentar
                </button>
            )}
        </div>
    );
}
