'use client';

import { useEffect, useMemo, useState } from 'react';

// Noticias de los últimos 7 días de las empresas con más peso en la cartera (ver /api/portfolio-news).
// Sin filtro, primero va la nota más relevante de cada empresa en orden de peso y después el resto por fecha:
// así las empresas más grandes de la cartera no quedan tapadas por las que tienen más prensa.

const MAX_COMPANIES = 8;
const PAGE = 8;

const linkBtn = { color: 'var(--signal-text)', textDecoration: 'underline', textUnderlineOffset: '3px', background: 'none', border: 0, cursor: 'pointer', padding: 0, font: 'inherit' };

function timeAgo(iso) {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (diff < 3600) return `hace ${Math.max(1, Math.floor(diff / 60))} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    const days = Math.floor(diff / 86400);
    return days === 1 ? 'ayer' : `hace ${days} días`;
}

export default function PortfolioNews({ companies }) {
    const top = useMemo(() => companies.slice(0, MAX_COMPANIES), [companies]);
    const key = top.map((c) => c.catalogSymbol).join(',');
    const [state, setState] = useState({ key: null, items: [], status: 'loading' });
    const [filter, setFilter] = useState('ALL');
    const [expanded, setExpanded] = useState(false);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!key) return;
        let alive = true;
        fetch(`/api/portfolio-news?symbols=${encodeURIComponent(key)}`)
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error('noticias'))))
            .then((d) => { if (alive) setState({ key, items: d.items ?? [], status: d.failed ? 'error' : 'ok' }); })
            .catch(() => { if (alive) setState({ key, items: [], status: 'error' }); });
        return () => { alive = false; };
    }, [key, tick]);

    const loading = state.key !== key || state.status === 'loading';
    const tickerOf = useMemo(() => new Map(top.map((c) => [c.catalogSymbol, c.symbol])), [top]);

    const ordered = useMemo(() => {
        // Con una empresa elegida, el orden de relevancia del servidor (negocios y en español primero).
        if (filter !== 'ALL') return state.items.filter((n) => n.symbols.includes(filter)).sort((a, b) => a.rank - b.rank);
        const used = new Set();
        const featured = [];
        for (const c of top) {
            const best = state.items
                .filter((n) => n.symbols.includes(c.catalogSymbol) && !used.has(n))
                .sort((a, b) => a.rank - b.rank || b.date.localeCompare(a.date))[0];
            if (best) { used.add(best); featured.push(best); }
        }
        return [...featured, ...state.items.filter((n) => !used.has(n))];
    }, [state.items, filter, top]);

    const counts = useMemo(() => {
        const m = new Map();
        for (const n of state.items) for (const s of n.symbols) m.set(s, (m.get(s) ?? 0) + 1);
        return m;
    }, [state.items]);

    const shown = expanded ? ordered : ordered.slice(0, PAGE);
    const choose = (value) => { setFilter(value); setExpanded(false); };

    return (
        <section aria-labelledby="noticias-empresas" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="section-head" style={{ marginBottom: 0, flexWrap: 'wrap' }}>
                <h2 id="noticias-empresas" className="h2" style={{ margin: 0 }}>Noticias de tus empresas</h2>
                <span className="body-sm" style={{ color: 'var(--ink-subtle)' }}>Últimos 7 días · Google News</span>
            </div>

            {!loading && state.items.length > 0 && (
                <div role="group" aria-label="Filtrar noticias por empresa" className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
                    <button type="button" className={filter === 'ALL' ? 'pill-active' : 'pill-inactive'} aria-pressed={filter === 'ALL'} onClick={() => choose('ALL')}>
                        Todas <span className="data" style={{ marginLeft: '6px', color: 'var(--ink-subtle)' }}>{state.items.length}</span>
                    </button>
                    {top.filter((c) => counts.has(c.catalogSymbol)).map((c) => (
                        <button
                            key={c.catalogSymbol}
                            type="button"
                            className={filter === c.catalogSymbol ? 'pill-active' : 'pill-inactive'}
                            aria-pressed={filter === c.catalogSymbol}
                            onClick={() => choose(c.catalogSymbol)}
                        >
                            {c.symbol} <span className="data" style={{ marginLeft: '6px', color: 'var(--ink-subtle)' }}>{counts.get(c.catalogSymbol)}</span>
                        </button>
                    ))}
                </div>
            )}

            <div style={{ background: 'var(--surface-100)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {loading && (
                    <ul aria-busy="true" aria-label="Cargando noticias" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {[0, 1, 2, 3].map((i) => (
                            <li key={i} style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <span className="skeleton" style={{ height: '12px', width: '120px' }} />
                                <span className="skeleton" style={{ height: '16px', width: `${70 - i * 8}%` }} />
                            </li>
                        ))}
                    </ul>
                )}

                {!loading && state.status === 'error' && state.items.length === 0 && (
                    <p role="status" className="body-sm" style={{ margin: 0, padding: 'var(--space-4)', color: 'var(--ink-muted)' }}>
                        No pudimos traer las noticias ahora.{' '}
                        <button type="button" style={linkBtn} onClick={() => setTick((t) => t + 1)}>Reintentar</button>
                    </p>
                )}

                {!loading && state.status === 'ok' && state.items.length === 0 && (
                    <p className="body-sm" style={{ margin: 0, padding: 'var(--space-4)', color: 'var(--ink-muted)' }}>
                        No encontramos noticias de tus empresas en los últimos 7 días.
                    </p>
                )}

                {!loading && shown.length > 0 && (
                    <ul className="pulso-fade-in" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {shown.map((n) => (
                            <li key={n.link} style={{ borderBottom: '1px solid var(--line)' }}>
                                <a
                                    href={n.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', padding: 'var(--space-3) var(--space-4)', color: 'inherit', textDecoration: 'none', minHeight: '56px' }}
                                    className="hover:bg-[var(--surface-200)]"
                                >
                                    <span className="flex flex-wrap items-center" style={{ gap: 'var(--space-2)' }}>
                                        {n.symbols.map((s) => (
                                            <span key={s} className="source-badge" style={{ color: 'var(--signal-text)' }}>{tickerOf.get(s) ?? s}</span>
                                        ))}
                                        <span className="body-sm" style={{ color: 'var(--ink-subtle)' }}>{n.source} · {timeAgo(n.date)}</span>
                                    </span>
                                    <span className="body" style={{ color: 'var(--ink)', fontWeight: 600, lineHeight: 1.35 }}>
                                        {n.title}<span className="sr-only"> (se abre en otra pestaña)</span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {!loading && ordered.length > PAGE && (
                <div>
                    <button type="button" className="body-sm" style={linkBtn} onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
                        {expanded ? 'Ver menos noticias' : `Ver ${ordered.length - PAGE} noticias más`}
                    </button>
                </div>
            )}

            {companies.length > MAX_COMPANIES && (
                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-subtle)' }}>
                    Mostramos las {MAX_COMPANIES} empresas con más peso en tu cartera.
                </p>
            )}
        </section>
    );
}
