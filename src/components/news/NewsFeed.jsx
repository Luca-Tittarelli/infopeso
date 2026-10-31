'use client';

import { useState } from 'react';
import { useNews } from '../../hooks/useNews';

const CATEGORIES = [
    { id: 'all', label: 'Todas' },
    { id: 'Tipo de Cambio', label: 'Dólar' },
    { id: 'Inflación', label: 'Inflación' },
    { id: 'Política Monetaria', label: 'BCRA' },
    { id: 'Deuda & Bonos', label: 'Bonos' },
    { id: 'Mercado', label: 'Mercado' },
];

function NewsCardSkeleton() {
    return (
        <div
            className="pulso-card"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ height: '12px', width: '90px' }} />
                <div className="skeleton" style={{ height: '12px', width: '50px' }} />
            </div>
            <div className="skeleton" style={{ height: '18px', width: '100%' }} />
            <div className="skeleton" style={{ height: '18px', width: '80%' }} />
            <div className="skeleton" style={{ height: '24px', width: '100px', borderRadius: 'var(--radius-pill)', marginTop: 'var(--space-2)' }} />
        </div>
    );
}

function NewsCard({ item }) {
    return (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="pulso-card"
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 'var(--space-4)',
                textDecoration: 'none',
                minHeight: '160px',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-200)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-100)';
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                    <span className="label" style={{ color: 'var(--ink-subtle)' }}>
                        {item.source}
                    </span>
                    <span className="label" style={{ color: 'var(--ink-subtle)' }}>
                        {item.timeAgo}
                    </span>
                </div>

                <h3
                    className="body"
                    style={{
                        margin: 0,
                        fontWeight: 700,
                        color: 'var(--ink)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {item.title}
                </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <span className="source-badge">
                    {item.category?.label || 'MERCADO'}
                </span>
                <span className="label" style={{ color: 'var(--signal-text)' }}>
                    LEER NOTA →
                </span>
            </div>
        </a>
    );
}

export function NewsFeed({ initialNews = null }) {
    const { news, status } = useNews(initialNews);
    const [activeCategory, setActiveCategory] = useState('all');

    const filtered =
        activeCategory === 'all'
            ? news
            : news.filter((n) => n.category?.label === activeCategory);

    return (
        <section style={{ paddingTop: 'var(--space-12)' }}>
            <div className="pulso-container">
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-6)',
                        paddingBottom: 'var(--space-4)',
                        borderBottom: '1px solid var(--line)',
                    }}
                >
                    <div>
                        <p className="label" style={{ color: 'var(--ink-subtle)', margin: '0 0 var(--space-1) 0' }}>
                            PRENSA ECONÓMICA · ÚLTIMAS 72 HORAS
                        </p>
                        <h2 className="h1" style={{ margin: 0, color: 'var(--ink)' }}>
                            Noticias que mueven el mercado
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveCategory(cat.id)}
                                className={activeCategory === cat.id ? 'pill-active' : 'pill-inactive'}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {status === 'loading' && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: 'var(--space-4)',
                        }}
                    >
                        {[1, 2, 3, 4].map((i) => (
                            <NewsCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {status === 'error' && (
                    <div className="pulso-card" style={{ textAlign: 'center' }}>
                        <p className="body" style={{ color: 'var(--ink)', fontWeight: 700, margin: 0 }}>
                            No pudimos cargar las noticias
                        </p>
                        <p className="body-sm" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                            Revisá tu conexión o volvé a intentar en unos minutos.
                        </p>
                    </div>
                )}

                {status === 'success' && filtered.length === 0 && (
                    <div className="pulso-card" style={{ textAlign: 'center' }}>
                        <p className="body" style={{ color: 'var(--ink)', fontWeight: 700, margin: 0 }}>
                            Sin noticias recientes en este filtro
                        </p>
                        <p className="body-sm" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                            Elegí otra categoría para ver los titulares de los últimos tres días.
                        </p>
                    </div>
                )}

                {status === 'success' && filtered.length > 0 && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: 'var(--space-4)',
                        }}
                    >
                        {filtered.map((item, i) => (
                            <NewsCard key={item.id || i} item={item} />
                        ))}
                    </div>
                )}

                <p className="body-sm" style={{ color: 'var(--ink-subtle)', marginTop: 'var(--space-6)', marginBottom: 0 }}>
                    Titulares recopilados de medios financieros argentinos. Tocá cualquier nota para leerla en su medio original.
                </p>
            </div>
        </section>
    );
}
