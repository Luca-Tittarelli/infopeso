export function LoadingCard() {
    return (
        <article
            className="w-full p-5 rounded-[12px]"
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
            }}
        >
            {/* Title row */}
            <div className="flex items-center justify-between mb-4">
                <div className="skeleton h-4 w-2/5" />
                <div className="skeleton h-5 w-12 rounded-full" />
            </div>

            {/* Sparkline placeholder */}
            <div className="skeleton h-10 w-full mb-4 rounded-md" />

            {/* Value */}
            <div className="skeleton h-7 w-3/5 mb-2" />

            {/* Variation + timestamp */}
            <div className="flex items-center justify-between mt-3">
                <div className="skeleton h-3.5 w-1/4" />
                <div className="skeleton h-3.5 w-1/4" />
            </div>
        </article>
    );
}