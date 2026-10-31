'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    CATEGORIES,
    PRESETS,
    getCompanyBySymbol,
    normalizeHoldings,
    calculatePortfolioMetrics,
} from '@/utils/carteraData';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { createClient } from '@/lib/supabase/client';
import { PORTFOLIO_STORAGE_KEY, loadRemotePortfolio, saveRemotePortfolio } from '@/lib/portfolioSync';
import CarteraAccountBar from './CarteraAccountBar';
import { MiniChart, FundamentalData } from 'react-ts-tradingview-widgets';
import { TradingViewContainer } from '@/components/TradingViewContainer';
import { Delta } from '@/components/pulso/Delta';
import { formatNumber } from '@/utils/formatters';

// ─── Iconos SVG inline (trazo 1.75px) ─────────────────────────────────────────
const PATHS = {
    search:       'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    x:            'M6 18L18 6M6 6l12 12',
    check:        'M5 13l4 4L19 7',
    plus:         'M12 4v16m8-8H4',
    trash:        'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    flame:        'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
    bank:         'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
    cpu:          'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
    shoppingBag:  'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    newspaper:    'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
    sparkle:      'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    sliders:      'M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6',
    chevronLeft:  'M15 19l-7-7 7-7',
    chevronRight: 'M9 5l7 7-7 7',
};

const Ico = ({ name, size = 14, className = '', strokeWidth = 1.75, style = {} }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        className={`shrink-0 ${className}`}
        aria-hidden="true"
    >
        <path d={PATHS[name] || PATHS.sparkle} />
    </svg>
);

const SectorIcon = ({ sector, size = 14 }) => {
    const map = {
        'Energía y Commodities':    'flame',
        'Finanzas y Fintech':       'bank',
        'Tecnología y Crecimiento': 'cpu',
        'Consumo y Otros':          'shoppingBag',
    };
    return <Ico name={map[sector] || 'sparkle'} size={size} />;
};

const CompanyLogo = ({ company, className = 'w-7 h-7' }) => {
    const [error, setError] = useState(false);
    useEffect(() => { setError(false); }, [company?.symbol]);
    if (!company) return null;

    if (error || !company.logo) {
        return (
            <div
                className={`${className} flex items-center justify-center shrink-0`}
                style={{
                    background: 'var(--surface-200)',
                    color: 'var(--ink)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 500,
                }}
            >
                {company.name.slice(0, 2).toUpperCase()}
            </div>
        );
    }
    return (
        <img
            src={company.logo}
            alt={company.name}
            loading="lazy"
            onError={() => setError(true)}
            className={`${className} object-contain p-0.5 shrink-0`}
            style={{
                background: 'var(--ground-000)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
            }}
        />
    );
};

const SemaphoreIndicator = ({ signal }) => {
    const cfg = {
        buy:     { label: '▲ Comprar',  color: 'var(--signal-text)' },
        hold:    { label: '= Mantener', color: 'var(--ink-muted)'   },
        sell:    { label: '▼ Vender',   color: 'var(--down)'        },
        unknown: { label: '—',          color: 'var(--ink-subtle)'  },
    }[signal || 'unknown'];

    return (
        <span
            className="inline-flex items-center"
            style={{
                padding: '2px var(--space-2)',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-200)',
                color: cfg.color,
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 500,
            }}
        >
            {cfg.label}
        </span>
    );
};

// ─── Slider de Noticias ───────────────────────────────────────────────────────
const BloombergNewsSlider = ({ holdings }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [isExpanded, setIsExpanded] = useState(false);

    const holdingsKey = useMemo(() => holdings?.map(h => `${h.symbol}:${h.weight}`).join(',') || '', [holdings]);

    useEffect(() => {
        if (!holdings || holdings.length === 0) return;
        let alive = true;

        const fetchPortfolioNews = async () => {
            setLoading(true);
            try {
                const queries = holdings.map(h => {
                    const comp = getCompanyBySymbol(h.symbol);
                    return comp?.newsQuery || h.symbol;
                });
                
                const queryStr = queries.slice(0, 8).join(' OR ');
                let rawNews = [];

                try {
                    const apiRes = await fetch(`/api/news?q=${encodeURIComponent(queryStr)}`);
                    if (apiRes.ok) {
                        rawNews = await apiRes.json();
                    }
                } catch {
                    // fallback to RSS
                }

                if (!rawNews || rawNews.length === 0) {
                    const q = encodeURIComponent(`(${queryStr}) when:7d`);
                    let res = await fetch(`/gnews-rss/rss/search?q=${q}&hl=es-419&gl=AR&ceid=AR%3Aes-419`);
                    let xml = '';
                    if (res.ok) xml = await res.text();
                    let doc = new DOMParser().parseFromString(xml, 'application/xml');
                    let itemsRaw = Array.from(doc.querySelectorAll('item'));

                    if (itemsRaw.length === 0) {
                        const fallbackQ = encodeURIComponent('(acciones OR merval OR cedears OR bolsa OR empresas) when:7d');
                        const fallbackRes = await fetch(`/gnews-rss/rss/search?q=${fallbackQ}&hl=es-419&gl=AR&ceid=AR%3Aes-419`);
                        if (fallbackRes.ok) {
                            const fallbackXml = await fallbackRes.text();
                            doc = new DOMParser().parseFromString(fallbackXml, 'application/xml');
                            itemsRaw = Array.from(doc.querySelectorAll('item'));
                        }
                    }

                    rawNews = itemsRaw.slice(0, 20).map(item => {
                        const title = (item.querySelector('title')?.textContent || '').replace(/\s+-\s+[^-\n]+$/, '');
                        const link = item.querySelector('link')?.textContent || '#';
                        const pubDate = item.querySelector('pubDate')?.textContent || '';
                        const source = item.querySelector('source')?.textContent || 'Prensa';
                        let timeStr = '';
                        if (pubDate) {
                            const diff = Math.floor((Date.now() - new Date(pubDate)) / 1000);
                            if (diff < 60) timeStr = 'ahora';
                            else if (diff < 3600) timeStr = `${Math.floor(diff / 60)}m`;
                            else if (diff < 86400) timeStr = `${Math.floor(diff / 3600)}h`;
                            else timeStr = `${Math.floor(diff / 86400)}d`;
                        }
                        return { title, link, timeAgo: timeStr, source };
                    });
                }

                const items = rawNews.slice(0, 20).map(item => {
                    const title = (item.title || '').replace(/\s+-\s+[^-\n]+$/, '');
                    let matchedSymbol = holdings[0]?.symbol || 'MERCADO';
                    for (const h of holdings) {
                        const comp = getCompanyBySymbol(h.symbol);
                        const lowerTitle = title.toLowerCase();
                        if (
                            lowerTitle.includes(h.symbol.toLowerCase().replace('.ba', '')) ||
                            (comp && lowerTitle.includes(comp.name.toLowerCase()))
                        ) {
                            matchedSymbol = h.symbol;
                            break;
                        }
                    }

                    return {
                        title,
                        link: item.link || '#',
                        timeAgo: item.timeAgo || '',
                        source: item.source || 'Prensa',
                        symbol: matchedSymbol,
                    };
                });

                if (alive) {
                    setNews(items);
                    setLoading(false);
                }
            } catch {
                if (alive) setLoading(false);
            }
        };

        fetchPortfolioNews();
        return () => { alive = false; };
    }, [holdingsKey]);

    const filteredNews = useMemo(() => {
        if (selectedFilter === 'ALL') return news;
        return news.filter(n => n.symbol === selectedFilter);
    }, [news, selectedFilter]);

    useEffect(() => {
        if (isPaused || filteredNews.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % filteredNews.length);
        }, 4800);
        return () => clearInterval(timer);
    }, [isPaused, filteredNews.length]);

    const handlePrev = () => {
        if (filteredNews.length === 0) return;
        setCurrentIndex(prev => (prev - 1 + filteredNews.length) % filteredNews.length);
    };

    const handleNext = () => {
        if (filteredNews.length === 0) return;
        setCurrentIndex(prev => (prev + 1) % filteredNews.length);
    };

    const currentItem = filteredNews[currentIndex] || filteredNews[0];

    if (loading) {
        return (
            <div
                className="flex items-center gap-3"
                style={{
                    background: 'var(--surface-100)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                }}
            >
                <span className="source-badge">NOTICIAS DE CARTERA</span>
                <div className="skeleton h-4 flex-1" />
            </div>
        );
    }

    if (news.length === 0) {
        return (
            <div
                className="flex items-center justify-between gap-3"
                style={{
                    background: 'var(--surface-100)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                }}
            >
                <span className="source-badge">NOTICIAS DE CARTERA</span>
                <p className="body-sm" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                    Cargando novedades de las empresas en cartera…
                </p>
            </div>
        );
    }

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
                background: 'var(--surface-100)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
            }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="source-badge" style={{ color: 'var(--signal-text)' }}>
                        NOTICIAS
                    </span>

                    <div className="hidden md:flex items-center gap-1 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => { setSelectedFilter('ALL'); setCurrentIndex(0); }}
                            style={{
                                padding: '2px var(--space-2)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: selectedFilter === 'ALL' ? 'var(--ink)' : 'var(--ground-000)',
                                color: selectedFilter === 'ALL' ? 'var(--ground-000)' : 'var(--ink-muted)',
                                border: '1px solid var(--line)',
                                cursor: 'pointer',
                            }}
                        >
                            Todas
                        </button>
                        {holdings.slice(0, 5).map(h => (
                            <button
                                key={h.symbol}
                                type="button"
                                onClick={() => { setSelectedFilter(h.symbol); setCurrentIndex(0); }}
                                style={{
                                    padding: '2px var(--space-2)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '11px',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 500,
                                    background: selectedFilter === h.symbol ? 'var(--ink)' : 'var(--ground-000)',
                                    color: selectedFilter === h.symbol ? 'var(--ground-000)' : 'var(--ink-muted)',
                                    border: '1px solid var(--line)',
                                    cursor: 'pointer',
                                }}
                            >
                                {h.symbol}
                            </button>
                        ))}
                    </div>
                </div>

                {currentItem && (
                    <div className="flex-1 min-w-0 flex items-center gap-2 sm:mx-3">
                        <span className="source-badge shrink-0">
                            {currentItem.symbol}
                        </span>

                        <a
                            href={currentItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="body-sm truncate hover:underline flex-1"
                            style={{ color: 'var(--ink)', fontWeight: 600 }}
                            title={currentItem.title}
                        >
                            {currentItem.title}
                        </a>

                        <div
                            className="flex items-center gap-1.5 shrink-0"
                            style={{ color: 'var(--ink-subtle)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                        >
                            <span className="hidden sm:inline">{currentItem.source}</span>
                            <span>·</span>
                            <span>{currentItem.timeAgo}</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-subtle)', marginRight: 'var(--space-1)' }}>
                        {currentIndex + 1}/{filteredNews.length}
                    </span>
                    <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Noticia anterior"
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--line)',
                            background: 'var(--ground-000)',
                            color: 'var(--ink-muted)',
                            cursor: 'pointer',
                        }}
                    >
                        <Ico name="chevronLeft" size={12} />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Siguiente noticia"
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--line)',
                            background: 'var(--ground-000)',
                            color: 'var(--ink-muted)',
                            cursor: 'pointer',
                        }}
                    >
                        <Ico name="chevronRight" size={12} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsExpanded(prev => !prev)}
                        className="flex items-center gap-1.5"
                        style={{
                            padding: '4px var(--space-3)',
                            marginLeft: 'var(--space-1)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: isExpanded ? 'var(--ink)' : 'var(--ground-000)',
                            color: isExpanded ? 'var(--ground-000)' : 'var(--ink-muted)',
                            border: '1px solid var(--line)',
                            cursor: 'pointer',
                        }}
                    >
                        <Ico name="newspaper" size={12} />
                        <span>{isExpanded ? 'Ocultar' : `Ver noticias (${filteredNews.length})`}</span>
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--line)', background: 'var(--surface-100)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="label" style={{ color: 'var(--ink)' }}>
                                Noticias destacadas de la cartera
                            </span>
                            <span className="source-badge">
                                {filteredNews.length} artículos
                            </span>
                        </div>
                        {selectedFilter !== 'ALL' && (
                            <button
                                type="button"
                                onClick={() => setSelectedFilter('ALL')}
                                className="body-sm hover:underline"
                                style={{ color: 'var(--signal-text)', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                Ver todas las empresas
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-3)' }}>
                        {filteredNews.map((n, idx) => (
                            <a
                                key={idx}
                                href={n.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: 'var(--space-3)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--line)',
                                    background: 'var(--ground-000)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2" style={{ fontSize: '11px', color: 'var(--ink-subtle)' }}>
                                        <div className="flex items-center gap-1.5">
                                            <span className="source-badge" style={{ color: 'var(--signal-text)' }}>
                                                {n.symbol}
                                            </span>
                                            <span>{n.source}</span>
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-mono)' }}>{n.timeAgo}</span>
                                    </div>
                                    <p className="body-sm line-clamp-2" style={{ color: 'var(--ink)', fontWeight: 600, margin: 0 }}>
                                        {n.title}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Modal de Configuración y Ponderaciones ────────────────────────────────────
const WeightsModal = ({ holdings, onSave, onClose }) => {
    const [localHoldings, setLocalHoldings] = useState(() => normalizeHoldings(holdings));
    const [searchQuery, setSearchQuery] = useState('');

    const totalWeight = useMemo(() => {
        return localHoldings.reduce((sum, h) => sum + (Number(h.weight) || 0), 0);
    }, [localHoldings]);

    const handleWeightChange = (symbol, val) => {
        const num = Math.max(0, Math.min(100, Number(val) || 0));
        setLocalHoldings(prev => prev.map(h => h.symbol === symbol ? { ...h, weight: num } : h));
    };

    const handleEquiponderar = () => {
        if (localHoldings.length === 0) return;
        const eq = Number((100 / localHoldings.length).toFixed(1));
        setLocalHoldings(prev => prev.map(h => ({ ...h, weight: eq })));
    };

    const handleToggleCompany = (sym) => {
        setLocalHoldings(prev => {
            const exists = prev.some(h => h.symbol === sym);
            if (exists) {
                return normalizeHoldings(prev.filter(h => h.symbol !== sym));
            } else {
                return normalizeHoldings([...prev, { symbol: sym, weight: 10 }]);
            }
        });
    };

    const handleApplyPreset = (preset) => {
        setLocalHoldings(preset.holdings);
    };

    const q = searchQuery.toLowerCase();
    const availableCategories = CATEGORIES.map(cat => ({
        ...cat,
        companies: cat.companies.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.symbol.toLowerCase().includes(q) ||
            c.sector.toLowerCase().includes(q)
        )
    })).filter(cat => cat.companies.length > 0);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'var(--ground-000)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Personalizar cartera"
        >
            <div
                className="w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]"
                style={{
                    background: 'var(--surface-100)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between"
                    style={{
                        padding: 'var(--space-4) var(--space-5)',
                        borderBottom: '1px solid var(--line)',
                    }}
                >
                    <div>
                        <p className="label" style={{ color: 'var(--signal-text)', margin: '0 0 var(--space-1) 0' }}>
                            Personalizar cartera
                        </p>
                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                            Elegí tus acciones y porcentajes
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                        style={{
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--line)',
                            background: 'var(--ground-000)',
                            color: 'var(--ink-muted)',
                            cursor: 'pointer',
                        }}
                    >
                        <Ico name="x" size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto space-y-6" style={{ padding: 'var(--space-5)' }}>
                    {/* Presets rápidos */}
                    <div>
                        <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-2)' }}>
                            Carteras sugeridas (1 clic)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 'var(--space-2)' }}>
                            {PRESETS.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleApplyPreset(p)}
                                    style={{
                                        padding: 'var(--space-3)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--line)',
                                        background: 'var(--ground-000)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <p className="body-sm truncate" style={{ fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                                        {p.name.split('(')[0]}
                                    </p>
                                    <p className="truncate mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-subtle)', margin: 0 }}>
                                        {p.holdings.map(h => h.symbol).join(' · ')}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tus acciones seleccionadas */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                                Tus acciones ({localHoldings.length})
                            </p>
                            <button
                                type="button"
                                onClick={handleEquiponderar}
                                style={{
                                    padding: '4px var(--space-3)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--line)',
                                    background: 'var(--ground-000)',
                                    color: 'var(--ink-muted)',
                                    fontSize: 'var(--text-caption)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Equiponderar partes iguales
                            </button>
                        </div>

                        {localHoldings.length === 0 ? (
                            <div
                                className="body-sm text-center"
                                style={{
                                    padding: 'var(--space-6)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px dashed var(--line)',
                                    color: 'var(--ink-subtle)',
                                }}
                            >
                                No hay acciones seleccionadas. Elegí una cartera sugerida o buscá abajo.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {localHoldings.map(h => {
                                    const comp = getCompanyBySymbol(h.symbol);
                                    return (
                                        <div
                                            key={h.symbol}
                                            className="flex items-center gap-3"
                                            style={{
                                                padding: 'var(--space-3)',
                                                borderRadius: 'var(--radius-sm)',
                                                background: 'var(--ground-000)',
                                                border: '1px solid var(--line)',
                                            }}
                                        >
                                            <CompanyLogo company={comp} className="w-7 h-7" />
                                            <div className="w-28 min-w-0">
                                                <p className="body-sm truncate" style={{ fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                                                    {comp?.name || h.symbol}
                                                </p>
                                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-subtle)', margin: 0 }}>
                                                    {h.symbol}
                                                </p>
                                            </div>

                                            <div className="flex-1 flex items-center gap-3">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="100"
                                                    value={h.weight}
                                                    onChange={e => handleWeightChange(h.symbol, e.target.value)}
                                                    className="flex-1 cursor-pointer"
                                                    style={{ accentColor: 'var(--signal)' }}
                                                />
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="100"
                                                        value={h.weight}
                                                        onChange={e => handleWeightChange(h.symbol, e.target.value)}
                                                        className="data text-center"
                                                        style={{
                                                            width: '52px',
                                                            padding: '2px 4px',
                                                            borderRadius: 'var(--radius-sm)',
                                                            background: 'var(--surface-100)',
                                                            border: '1px solid var(--line)',
                                                            color: 'var(--ink)',
                                                        }}
                                                    />
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink-subtle)' }}>%</span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleToggleCompany(h.symbol)}
                                                aria-label={`Quitar ${comp?.name || h.symbol}`}
                                                style={{
                                                    padding: 'var(--space-1)',
                                                    color: 'var(--ink-subtle)',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Ico name="trash" size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Catálogo de acciones */}
                    <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                        <p className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                            Agregar otras acciones al portafolio
                        </p>

                        <div className="relative">
                            <span
                                style={{
                                    position: 'absolute',
                                    left: 'var(--space-3)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--ink-subtle)',
                                }}
                            >
                                <Ico name="search" size={14} />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nombre o ticker… (ej. YPF, Apple, bancos)"
                                className="pulso-input body-sm"
                                style={{ paddingLeft: 'var(--space-8)', minHeight: '40px' }}
                            />
                        </div>

                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                            {availableCategories.map(cat => (
                                <div key={cat.name} className="space-y-1.5">
                                    <p className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                                        {cat.name}
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 'var(--space-2)' }}>
                                        {cat.companies.map(c => {
                                            const isSelected = localHoldings.some(h => h.symbol === c.symbol);
                                            return (
                                                <button
                                                    key={c.symbol}
                                                    type="button"
                                                    onClick={() => handleToggleCompany(c.symbol)}
                                                    className="flex items-center gap-2 text-left"
                                                    style={{
                                                        padding: 'var(--space-2)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        background: isSelected ? 'var(--surface-200)' : 'var(--ground-000)',
                                                        border: isSelected ? '1px solid var(--ink)' : '1px solid var(--line)',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <CompanyLogo company={c} className="w-5 h-5" />
                                                    <span className="body-sm truncate flex-1" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                                                        {c.name}
                                                    </span>
                                                    <Ico
                                                        name={isSelected ? 'check' : 'plus'}
                                                        size={12}
                                                        style={{ color: isSelected ? 'var(--signal-text)' : 'var(--ink-subtle)' }}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="flex items-center justify-between"
                    style={{
                        padding: 'var(--space-4) var(--space-5)',
                        borderTop: '1px solid var(--line)',
                        background: 'var(--ground-000)',
                    }}
                >
                    <span className="body-sm" style={{ color: 'var(--ink-muted)' }}>
                        Total:{' '}
                        <strong className="data" style={{ color: Math.round(totalWeight) === 100 ? 'var(--ink)' : 'var(--signal-text)' }}>
                            {formatNumber(totalWeight, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} %
                        </strong>
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="pulso-btn pulso-btn--secondary"
                            style={{ height: '40px' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={() => onSave(localHoldings)}
                            disabled={localHoldings.length === 0}
                            className="pulso-btn pulso-btn--primary"
                            style={{ height: '40px' }}
                        >
                            Guardar cartera
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Cartera guardada en este navegador (usuarios sin cuenta o antes de importarla a una).
function readLocalHoldings() {
    try {
        const parsed = JSON.parse(localStorage.getItem(PORTFOLIO_STORAGE_KEY) || 'null');
        if (Array.isArray(parsed) && parsed.length > 0) return normalizeHoldings(parsed);
    } catch {
        // JSON corrupto: se ignora y se usa la cartera inicial
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function CarteraClient() {
    const [holdings, setHoldings] = useState([]);
    const [detailSymbol, setDetailSymbol] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const [showWeightsModal, setShowWeightsModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const [fundamentalsMap, setFundamentalsMap] = useState({});
    const [googleNews, setGoogleNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [showMoreCompanyNews, setShowMoreCompanyNews] = useState(false);

    // Cuentas: con sesión la cartera vive en Supabase; sin sesión (o sin Supabase) sigue en localStorage.
    const { user, ready, enabled } = useSupabaseUser();
    const userId = user?.id ?? null;
    const portfolioIdRef = useRef(null);
    const [syncState, setSyncState] = useState('idle'); // idle | saving | saved | error
    const [importedLocal, setImportedLocal] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!ready) return;
        let alive = true;

        const start = (list) => {
            if (!alive) return;
            setHoldings(list);
            setDetailSymbol(list[0].symbol);
            setIsMounted(true);
        };

        (async () => {
            const local = readLocalHoldings();
            portfolioIdRef.current = null;

            if (!userId) {
                setSyncState('idle');
                start(local ?? PRESETS[0].holdings);
                return;
            }

            setSyncState('saving');
            try {
                const supabase = createClient();
                const remote = await loadRemotePortfolio(supabase);
                if (!alive) return;
                portfolioIdRef.current = remote.portfolioId;

                if (remote.holdings.length > 0) {
                    setSyncState('saved');
                    start(normalizeHoldings(remote.holdings));
                    return;
                }

                // Cuenta nueva con una cartera previa en este navegador: se mueve a la cuenta.
                if (local) {
                    await saveRemotePortfolio(supabase, remote.portfolioId, local);
                    localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
                    setImportedLocal(true);
                    setSyncState('saved');
                    start(local);
                    return;
                }

                setSyncState('saved');
                start(PRESETS[0].holdings);
            } catch (err) {
                console.warn('No se pudo cargar la cartera de la cuenta:', err.message);
                setSyncState('error');
                start(local ?? PRESETS[0].holdings);
            }
        })();

        return () => { alive = false; };
    }, [ready, userId, reloadKey]);

    const saveHoldings = async (nextHoldings) => {
        const normalized = normalizeHoldings(nextHoldings);
        setHoldings(normalized);
        if (normalized.length > 0 && !normalized.some(h => h.symbol === detailSymbol)) {
            setDetailSymbol(normalized[0].symbol);
        }

        if (!user) {
            localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(normalized));
            return;
        }
        if (!portfolioIdRef.current) {
            setSyncState('error');
            return;
        }
        setSyncState('saving');
        try {
            await saveRemotePortfolio(createClient(), portfolioIdRef.current, normalized);
            setSyncState('saved');
        } catch (err) {
            console.warn('No se pudo guardar la cartera en la cuenta:', err.message);
            setSyncState('error');
        }
    };

    const clearPortfolio = () => {
        if (window.confirm('¿Querés reiniciar tu cartera a la configuración inicial?')) {
            saveHoldings(PRESETS[0].holdings);
        }
    };

    useEffect(() => {
        if (!isMounted || holdings.length === 0) return;
        let alive = true;

        const fetchFundamentals = async () => {
            try {
                const symbols = holdings.map(h => h.symbol).join(',');
                const res = await fetch(`/api/portfolio-fundamentals?symbols=${encodeURIComponent(symbols)}`);
                if (!res.ok) throw new Error('Error en API');
                const data = await res.json();
                if (alive && data.fundamentals) {
                    setFundamentalsMap(data.fundamentals);
                }
            } catch (err) {
                console.warn('Error cargando fundamentals:', err.message);
            }
        };

        fetchFundamentals();
        return () => { alive = false; };
    }, [holdings, isMounted]);

    const metrics = useMemo(() => {
        return calculatePortfolioMetrics(holdings, fundamentalsMap);
    }, [holdings, fundamentalsMap]);

    const activeCompany = useMemo(() => {
        return getCompanyBySymbol(detailSymbol) ||
            (holdings.length > 0 ? getCompanyBySymbol(holdings[0].symbol) : null);
    }, [detailSymbol, holdings]);

    const activeFundamentals = activeCompany ? fundamentalsMap[activeCompany.symbol] || {} : {};

    useEffect(() => {
        setShowMoreCompanyNews(false);
        if (!activeCompany?.newsQuery) return;
        let alive = true;
        const fetchNews = async () => {
            setNewsLoading(true);
            setGoogleNews([]);
            try {
                const q = encodeURIComponent(`${activeCompany.newsQuery} when:7d`);
                const res = await fetch(`/gnews-rss/rss/search?q=${q}&hl=es-419&gl=AR&ceid=AR%3Aes-419`);
                if (!res.ok) throw new Error();
                const xml = await res.text();
                const doc = new DOMParser().parseFromString(xml, 'application/xml');
                const parsed = Array.from(doc.querySelectorAll('item')).slice(0, 10).map(item => {
                    const pubDate = item.querySelector('pubDate')?.textContent || '';
                    let timeStr = '';
                    if (pubDate) {
                        const diff = Math.floor((Date.now() - new Date(pubDate)) / 1000);
                        if (diff < 60) timeStr = 'ahora';
                        else if (diff < 3600) timeStr = `hace ${Math.floor(diff / 60)}m`;
                        else if (diff < 86400) timeStr = `hace ${Math.floor(diff / 3600)}h`;
                        else timeStr = `hace ${Math.floor(diff / 86400)}d`;
                    }
                    return {
                        title: (item.querySelector('title')?.textContent || '').replace(/\s+-\s+[^-\n]+$/, ''),
                        link: item.querySelector('link')?.textContent || '#',
                        timeAgo: timeStr,
                        source: item.querySelector('source')?.textContent || 'Prensa',
                    };
                });
                if (alive) setGoogleNews(parsed);
            } catch {
                // Ignore news error
            } finally {
                if (alive) setNewsLoading(false);
            }
        };
        fetchNews();
        return () => { alive = false; };
    }, [activeCompany?.symbol, activeCompany?.newsQuery]);

    if (!isMounted) return <main style={{ minHeight: '100vh' }} aria-busy="true" />;

    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            {showWeightsModal && (
                <WeightsModal
                    holdings={holdings}
                    onSave={(newHoldings) => {
                        saveHoldings(newHoldings);
                        setShowWeightsModal(false);
                    }}
                    onClose={() => setShowWeightsModal(false)}
                />
            )}

            {/* Encabezado */}
            <header
                style={{
                    borderBottom: '1px solid var(--line)',
                    padding: 'var(--space-8) 0',
                }}
            >
                <div className="pulso-container flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="label" style={{ color: 'var(--signal-text)', margin: '0 0 var(--space-2) 0' }}>
                            Centro de monitoreo · Inversión personal
                        </p>
                        <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                            Mi cartera de acciones
                        </h1>
                        <p className="body" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                            Métricas clave, rentabilidad y diagnóstico consolidado de tus inversiones en tiempo real.
                        </p>
                    </div>

                    {/* Acciones: un único botón primario naranja en pantalla */}
                    <div className="flex items-center gap-3">
                        {!showWeightsModal && (
                            <button
                                type="button"
                                onClick={() => setShowWeightsModal(true)}
                                className="pulso-btn pulso-btn--primary"
                            >
                                <Ico name="sliders" size={16} />
                                Ajustar mi cartera ({holdings.length})
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={clearPortfolio}
                            className="pulso-btn pulso-btn--secondary"
                        >
                            Reiniciar cartera
                        </button>
                    </div>
                </div>
            </header>

            {enabled && (
                <CarteraAccountBar
                    user={user}
                    syncState={syncState}
                    imported={importedLocal}
                    onRetry={() => setReloadKey((k) => k + 1)}
                />
            )}

            <section style={{ padding: 'var(--space-8) 0' }}>
                <div className="pulso-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <BloombergNewsSlider holdings={holdings} />

                    {/* 4 Tarjetas Clave de la Cartera */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-4)' }}>
                        {/* 1. Rentabilidad del Negocio (ROE) */}
                        <article className="pulso-card flex flex-col justify-between" style={{ gap: 'var(--space-2)' }}>
                            <div className="flex items-center justify-between gap-2">
                                <p className="label" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                    Rentabilidad (ROE)
                                </p>
                                <span className="source-badge" style={{ color: (metrics.weightedROE || 0) >= 15 ? 'var(--signal-text)' : 'var(--ink-subtle)' }}>
                                    {(metrics.weightedROE || 0) >= 18 ? 'Alta' : (metrics.weightedROE || 0) >= 10 ? 'Sólida' : 'Moderada'}
                                </span>
                            </div>
                            <p className="figure" style={{ color: 'var(--ink)', margin: 0 }}>
                                {metrics.weightedROE ? (
                                    <>
                                        {formatNumber(metrics.weightedROE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                        <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginLeft: '0.2em' }}>%</span>
                                    </>
                                ) : '—'}
                            </p>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                                Ganancia anual sobre el patrimonio neto de las empresas.
                            </p>
                        </article>

                        {/* 2. Valuación (P/E) */}
                        <article className="pulso-card flex flex-col justify-between" style={{ gap: 'var(--space-2)' }}>
                            <div className="flex items-center justify-between gap-2">
                                <p className="label" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                    Valuación (P/E)
                                </p>
                                <span className="source-badge">
                                    {(metrics.weightedPE || 0) < 16 ? 'Value' : (metrics.weightedPE || 0) < 30 ? 'Razonable' : 'Growth'}
                                </span>
                            </div>
                            <p className="figure" style={{ color: 'var(--ink)', margin: 0 }}>
                                {metrics.weightedPE ? (
                                    <>
                                        {formatNumber(metrics.weightedPE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                        <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginLeft: '0.2em' }}>x</span>
                                    </>
                                ) : '—'}
                            </p>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                                Años de ganancias que cuesta comprar el portafolio hoy.
                            </p>
                        </article>

                        {/* 3. Dividendos Anuales */}
                        <article className="pulso-card flex flex-col justify-between" style={{ gap: 'var(--space-2)' }}>
                            <div className="flex items-center justify-between gap-2">
                                <p className="label" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                    Dividendos anuales
                                </p>
                                <span className="source-badge">Flujo estimado</span>
                            </div>
                            <p className="figure" style={{ color: 'var(--ink)', margin: 0 }}>
                                {formatNumber(metrics.weightedDividendYield || 0, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginLeft: '0.2em' }}>%</span>
                            </p>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                                Renta en efectivo anual estimada según pagos históricos.
                            </p>
                        </article>

                        {/* 4. Proyección de Analistas */}
                        <article className="pulso-card flex flex-col justify-between" style={{ gap: 'var(--space-2)' }}>
                            <div className="flex items-center justify-between gap-2">
                                <p className="label" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                    Potencial consenso
                                </p>
                                <span className="source-badge">12 meses</span>
                            </div>
                            <div>
                                {typeof metrics.weightedUpside === 'number' ? (
                                    <Delta value={metrics.weightedUpside} pill={true} />
                                ) : (
                                    <p className="figure" style={{ color: 'var(--ink-subtle)', margin: 0 }}>—</p>
                                )}
                            </div>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                                Variación promedio estimada por consenso de analistas.
                            </p>
                        </article>
                    </div>

                    {/* Navegación de Vistas */}
                    <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--line)' }}>
                        {[
                            { id: 'overview', label: 'Resumen y diagnóstico' },
                            { id: 'table',    label: 'Lista de acciones' },
                            { id: 'detail',   label: 'Ficha por acción' },
                        ].map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setActiveTab(t.id)}
                                className={activeTab === t.id ? 'pill-active' : 'pill-inactive'}
                                style={{ cursor: 'pointer' }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* VISTA 1: RESUMEN Y DIAGNÓSTICO */}
                    {activeTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                            <div className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h2 className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                                        Diagnóstico de diversificación
                                    </h2>
                                    <span className="body-sm" style={{ color: 'var(--ink-muted)' }}>
                                        Puntaje de balance:{' '}
                                        <strong className="data" style={{ color: 'var(--signal-text)' }}>
                                            {metrics.healthScore}/100
                                        </strong>
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-3)' }}>
                                    {metrics.diagnostics.map((d, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3"
                                            style={{
                                                padding: 'var(--space-4)',
                                                borderRadius: 'var(--radius-sm)',
                                                background: 'var(--ground-000)',
                                                border: '1px solid var(--line)',
                                            }}
                                        >
                                            <span
                                                aria-hidden="true"
                                                style={{
                                                    fontFamily: 'var(--font-mono)',
                                                    color: d.type === 'positive' ? 'var(--up)' : 'var(--down)',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {d.type === 'positive' ? '▲' : '▼'}
                                            </span>
                                            <div>
                                                <p
                                                    style={{
                                                        fontFamily: 'var(--font-sans)',
                                                        fontSize: 'var(--text-body-sm)',
                                                        fontWeight: 700,
                                                        color: d.type === 'positive' ? 'var(--signal-text)' : 'var(--ink)',
                                                        margin: 0,
                                                    }}
                                                >
                                                    {d.title}
                                                </p>
                                                <p className="body-sm" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                                                    {d.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Distribución por Sector & País */}
                            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
                                <div className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                    <h3 className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                                        Rubros y sectores
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                        {Object.entries(metrics.sectorBreakdown).map(([sector, pct]) => (
                                            <div key={sector} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                                <div className="flex items-center justify-between body-sm">
                                                    <span className="flex items-center gap-1.5" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                                                        <SectorIcon sector={sector} size={13} /> {sector}
                                                    </span>
                                                    <span className="data" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                                                        {formatNumber(pct, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} %
                                                    </span>
                                                </div>
                                                <div style={{ height: '6px', borderRadius: 'var(--radius-pill)', background: 'var(--ground-000)', overflow: 'hidden' }}>
                                                    <div
                                                        style={{
                                                            height: '100%',
                                                            width: `${pct}%`,
                                                            borderRadius: 'var(--radius-pill)',
                                                            background: 'var(--signal)',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pulso-card flex flex-col justify-between" style={{ gap: 'var(--space-4)' }}>
                                    <div>
                                        <h3 className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-3)' }}>
                                            Exposición geográfica
                                        </h3>
                                        <div className="grid grid-cols-2" style={{ gap: 'var(--space-3)' }}>
                                            {Object.entries(metrics.geoBreakdown).map(([geo, pct]) => (
                                                <div
                                                    key={geo}
                                                    className="text-center"
                                                    style={{
                                                        padding: 'var(--space-3)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        background: 'var(--ground-000)',
                                                        border: '1px solid var(--line)',
                                                    }}
                                                >
                                                    <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>{geo}</p>
                                                    <p className="figure" style={{ fontSize: 'var(--text-h1)', color: 'var(--ink)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                                                        {formatNumber(pct, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} %
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--space-3)' }}>
                                        <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-2)' }}>
                                            Próximos reportes de ganancias
                                        </p>
                                        {metrics.upcomingEarnings.length === 0 ? (
                                            <p className="body-sm" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                                                Sin fechas confirmadas en el corto plazo.
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {metrics.upcomingEarnings.slice(0, 3).map(e => (
                                                    <span key={e.symbol} className="source-badge">
                                                        <strong>{e.symbol}</strong>: {new Date(e.date).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VISTA 2: TABLA DE ACCIONES */}
                    {activeTab === 'table' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div className="pulso-card flex items-center justify-between flex-wrap gap-3">
                                <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                    Seleccioná cualquier fila para abrir la ficha detallada y noticias de esa empresa.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowWeightsModal(true)}
                                    className="pulso-btn pulso-btn--secondary"
                                    style={{ height: '36px', fontSize: 'var(--text-body-sm)' }}
                                >
                                    Editar porcentajes
                                </button>
                            </div>

                            <div
                                style={{
                                    background: 'var(--surface-100)',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden',
                                }}
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left" style={{ borderCollapse: 'collapse', minWidth: '720px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-subtle)' }}>
                                                <th scope="col" className="label" style={{ padding: 'var(--space-3) var(--space-4)' }}>Empresa</th>
                                                <th scope="col" className="label text-right" style={{ padding: 'var(--space-3) var(--space-3)' }}>Peso</th>
                                                <th scope="col" className="label text-right" style={{ padding: 'var(--space-3) var(--space-3)' }}>Precio actual</th>
                                                <th scope="col" className="label text-right" style={{ padding: 'var(--space-3) var(--space-3)' }}>Valuación (P/E)</th>
                                                <th scope="col" className="label text-right" style={{ padding: 'var(--space-3) var(--space-3)' }}>Rentabilidad (ROE)</th>
                                                <th scope="col" className="label text-right" style={{ padding: 'var(--space-3) var(--space-3)' }}>Dividendos</th>
                                                <th scope="col" className="label text-right" style={{ padding: 'var(--space-3) var(--space-3)' }}>Upside est.</th>
                                                <th scope="col" className="label text-center" style={{ padding: 'var(--space-3) var(--space-4)' }}>Consenso</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {holdings.map(h => {
                                                const comp = getCompanyBySymbol(h.symbol);
                                                const f = fundamentalsMap[h.symbol] || {};
                                                return (
                                                    <tr
                                                        key={h.symbol}
                                                        onClick={() => {
                                                            setDetailSymbol(h.symbol);
                                                            setActiveTab('detail');
                                                        }}
                                                        className="cursor-pointer transition-colors hover:bg-[var(--surface-200)]"
                                                        style={{ borderBottom: '1px solid var(--line)' }}
                                                    >
                                                        <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                                                            <div className="flex items-center gap-2.5">
                                                                <CompanyLogo company={comp} className="w-7 h-7" />
                                                                <div>
                                                                    <p className="body-sm" style={{ fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{comp?.name || h.symbol}</p>
                                                                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-subtle)', margin: 0 }}>{h.symbol}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="data text-right" style={{ padding: 'var(--space-3) var(--space-3)', color: 'var(--ink)' }}>
                                                            {formatNumber(h.weight, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} %
                                                        </td>
                                                        <td className="data text-right" style={{ padding: 'var(--space-3) var(--space-3)', color: 'var(--ink)' }}>
                                                            {f.price ? `${f.currency === 'ARS' ? '$ ' : 'US$ '}${formatNumber(f.price, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                                        </td>
                                                        <td className="data text-right" style={{ padding: 'var(--space-3) var(--space-3)', color: 'var(--ink)' }}>
                                                            {f.pe ? `${formatNumber(f.pe, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}x` : '—'}
                                                        </td>
                                                        <td className="data text-right" style={{ padding: 'var(--space-3) var(--space-3)', color: (f.roe || 0) >= 15 ? 'var(--signal-text)' : 'var(--ink)' }}>
                                                            {f.roe ? `${formatNumber(f.roe, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %` : '—'}
                                                        </td>
                                                        <td className="data text-right" style={{ padding: 'var(--space-3) var(--space-3)', color: 'var(--ink)' }}>
                                                            {f.dividendYield ? `${formatNumber(f.dividendYield, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %` : '0,0 %'}
                                                        </td>
                                                        <td className="text-right" style={{ padding: 'var(--space-3) var(--space-3)' }}>
                                                            {typeof f.upsidePotential === 'number' ? (
                                                                <Delta value={f.upsidePotential} />
                                                            ) : (
                                                                <span className="data" style={{ color: 'var(--ink-subtle)' }}>—</span>
                                                            )}
                                                        </td>
                                                        <td className="text-center" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                                                            <SemaphoreIndicator signal={f.recommendationKey === 'hold' ? 'hold' : ['buy', 'strong_buy', 'strongBuy'].includes(f.recommendationKey) ? 'buy' : 'unknown'} />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VISTA 3: FICHA INDIVIDUAL POR ACCIÓN */}
                    {activeTab === 'detail' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                            {/* Selector horizontal de acciones */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                {holdings.map(h => {
                                    const comp = getCompanyBySymbol(h.symbol);
                                    const isSel = activeCompany?.symbol === h.symbol;
                                    return (
                                        <button
                                            key={h.symbol}
                                            type="button"
                                            onClick={() => setDetailSymbol(h.symbol)}
                                            className={`flex items-center gap-2 shrink-0 ${isSel ? 'pill-active' : 'pill-inactive'}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <CompanyLogo company={comp} className="w-5 h-5" />
                                            <span>{comp?.name || h.symbol}</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.75 }}>
                                                ({formatNumber(h.weight, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} %)
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {activeCompany && (
                                <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
                                    <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        <div className="pulso-card flex items-center justify-between flex-wrap gap-4">
                                            <div>
                                                <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                                                    {activeCompany.name} ({activeCompany.symbol})
                                                </h2>
                                                <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                                    {activeCompany.sector} · {activeCompany.category}
                                                </p>
                                            </div>
                                            {activeFundamentals.price && (
                                                <div className="text-right">
                                                    <p className="figure" style={{ fontSize: 'var(--text-h1)', color: 'var(--ink)', margin: 0 }}>
                                                        <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginRight: '0.2em' }}>
                                                            {activeFundamentals.currency === 'ARS' ? '$' : 'US$'}
                                                        </span>
                                                        {formatNumber(activeFundamentals.price, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                    <div className="mt-1">
                                                        <Delta value={activeFundamentals.changePercent || 0} pill={true} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className="overflow-hidden"
                                            style={{
                                                border: '1px solid var(--line)',
                                                background: 'var(--surface-100)',
                                                borderRadius: 'var(--radius-md)',
                                                height: '360px',
                                            }}
                                        >
                                            <TradingViewContainer height="360px">
                                                {(activeTheme) => (
                                                    <MiniChart
                                                        key={`${activeCompany.tvSymbol}-${activeTheme}`}
                                                        symbol={activeCompany.tvSymbol}
                                                        colorTheme={activeTheme}
                                                        width="100%"
                                                        height="100%"
                                                        locale="es"
                                                        isTransparent
                                                        autosize
                                                    />
                                                )}
                                            </TradingViewContainer>
                                        </div>

                                        <div
                                            className="overflow-hidden"
                                            style={{
                                                border: '1px solid var(--line)',
                                                background: 'var(--surface-100)',
                                                borderRadius: 'var(--radius-md)',
                                                height: '240px',
                                            }}
                                        >
                                            <TradingViewContainer height="240px">
                                                {(activeTheme) => (
                                                    <FundamentalData
                                                        key={`${activeCompany.tvSymbol}-${activeTheme}`}
                                                        symbol={activeCompany.tvSymbol}
                                                        colorTheme={activeTheme}
                                                        width="100%"
                                                        height="100%"
                                                        locale="es"
                                                        isTransparent
                                                        displayMode="compact"
                                                    />
                                                )}
                                            </TradingViewContainer>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        <div className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                            <p className="label" style={{ color: 'var(--signal-text)', margin: 0 }}>
                                                Tesis de negocio
                                            </p>
                                            <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                                {activeCompany.description}
                                            </p>

                                            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--space-3)' }}>
                                                <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>
                                                    Modelo de ingresos
                                                </p>
                                                <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                                    {activeCompany.planDeNegocios}
                                                </p>
                                            </div>

                                            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--space-3)' }}>
                                                <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>
                                                    Variables para seguir de cerca
                                                </p>
                                                <ul className="body-sm space-y-1 pl-4 list-disc" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                                    {activeCompany.fundamentosClave.slice(0, 3).map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                            <p className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                                                Últimas noticias
                                            </p>
                                            {newsLoading ? (
                                                <div className="space-y-2">
                                                    <div className="skeleton h-3 w-1/2" />
                                                    <div className="skeleton h-4 w-full" />
                                                </div>
                                            ) : googleNews.length === 0 ? (
                                                <p className="body-sm" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                                                    Sin noticias recientes.
                                                </p>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                                    {googleNews.slice(0, showMoreCompanyNews ? 10 : 5).map((n, i) => (
                                                        <a
                                                            key={i}
                                                            href={n.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'block',
                                                                padding: 'var(--space-2) var(--space-3)',
                                                                borderRadius: 'var(--radius-sm)',
                                                                background: 'var(--ground-000)',
                                                                border: '1px solid var(--line)',
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between mb-0.5" style={{ fontSize: '11px', color: 'var(--ink-subtle)' }}>
                                                                <span>{n.source}</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)' }}>{n.timeAgo}</span>
                                                            </div>
                                                            <p className="body-sm" style={{ fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                                                                {n.title}
                                                            </p>
                                                        </a>
                                                    ))}
                                                    {googleNews.length > 5 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowMoreCompanyNews(prev => !prev)}
                                                            className="body-sm hover:underline"
                                                            style={{
                                                                color: 'var(--signal-text)',
                                                                fontWeight: 600,
                                                                background: 'transparent',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                marginTop: 'var(--space-1)',
                                                            }}
                                                        >
                                                            {showMoreCompanyNews ? 'Ver menos noticias' : `Ver más noticias (${googleNews.length})`}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Disclaimer obligatorio del manual */}
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', textAlign: 'center', margin: 0 }}>
                        Información con fines informativos. No es una recomendación de inversión.
                    </p>
                </div>
            </section>
        </main>
    );
}
