import Link from 'next/link';

export default function RelatedLinks({ title = 'Seguí viendo datos relacionados', links }) {
    if (!links?.length) return null;
    return (
        <nav
            aria-label={title}
            style={{
                marginTop: 'var(--space-12)',
                paddingTop: 'var(--space-8)',
                borderTop: '1px solid var(--line)',
            }}
        >
            <h2 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-4)', marginTop: 0 }}>
                {title}
            </h2>
            <ul
                style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: 'var(--space-3)',
                }}
            >
                {links.map(({ href, label, value }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--surface-100)',
                                border: '1px solid var(--line)',
                                color: 'var(--ink)',
                                textDecoration: 'none',
                            }}
                        >
                            <span className="body-sm" style={{ fontWeight: 700 }}>{label}</span>
                            {value ? (
                                <span className="data" style={{ color: 'var(--signal-text)' }}>{value}</span>
                            ) : (
                                <span className="label" style={{ color: 'var(--ink-subtle)' }}>→</span>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
