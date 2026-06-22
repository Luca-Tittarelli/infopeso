export function Loading() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 m-auto">
            {/* Animated dots */}
            <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                    <span
                        key={i}
                        className="block w-2 h-2 rounded-full"
                        style={{
                            background: 'var(--accent)',
                            animation: `fade-up 0.8s ease-in-out ${i * 180}ms infinite alternate`,
                            opacity: 0.7,
                        }}
                    />
                ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Cargando datos…
            </p>
        </div>
    );
}