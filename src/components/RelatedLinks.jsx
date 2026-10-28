import Link from 'next/link';

// links: [{ href, label, value? }]
export default function RelatedLinks({ title = 'También te puede interesar', links }) {
    if (!links?.length) return null;
    return (
        <nav aria-label={title} className="mt-10 pt-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                {title}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {links.map(({ href, label, value }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl text-sm transition-colors hover:underline"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        >
                            <span>{label}</span>
                            {value && <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{value}</span>}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
