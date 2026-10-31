'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/pulso/Button';
import { Delta } from '@/components/pulso/Delta';
import { formatNumber } from '@/utils/formatters';
import { CATEGORIES, calculatePortfolioMetrics } from '@/utils/carteraData';
import { usePositions } from '@/hooks/usePositions';
import { summarize, buildAlerts, KIND_LABELS } from '@/lib/portfolio/valuation';
import { brokersOf } from '@/lib/portfolio/positionsStore';
import { BROKERS } from '@/lib/portfolio/importCsv';
import CarteraAccountBar from './CarteraAccountBar';
import ImportPanel from './ImportPanel';
import Evolution from './Evolution';
import { track, trackOnce } from '@/lib/track';
import { rememberPortfolio } from '@/lib/portfolio/landingHint';
import { BloombergNewsSlider } from './CarteraClient';

// ─── Utilidades ───────────────────────────────────────────────────────────────

const ars = (n) => `$ ${formatNumber(n, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const usd = (n) => `US$ ${formatNumber(n, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const qty = (n) => formatNumber(n, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
const pct = (n, d = 1) => `${formatNumber(n, { minimumFractionDigits: d, maximumFractionDigits: d })} %`;

// Un tono por tipo de activo. Cada segmento también lleva su texto: el color nunca es el único dato.
const KIND_COLOR = {
    stock: 'var(--signal)',
    cedear: 'var(--down)',
    bond: 'var(--ink)',
    note: 'var(--ink-muted)',
    corp: 'var(--ink-subtle)',
    fund: 'var(--surface-200)',
    other: 'var(--surface-200)',
    cash: 'var(--line)',
};

const DEMO = [
    { broker: 'Ejemplo', symbol: 'GGAL', kind: 'stock', currency: 'ARS', quantity: 200, avgCost: null, fileValue: null },
    { broker: 'Ejemplo', symbol: 'YPFD', kind: 'stock', currency: 'ARS', quantity: 60, avgCost: null, fileValue: null },
    { broker: 'Ejemplo', symbol: 'AAPL', kind: 'cedear', currency: 'ARS', quantity: 30, avgCost: null, fileValue: null },
    { broker: 'Ejemplo', symbol: 'AL30', kind: 'bond', currency: 'ARS', quantity: 2000, avgCost: null, fileValue: null },
    { broker: 'Ejemplo', symbol: 'ARS', kind: 'cash', currency: 'ARS', quantity: 150000, avgCost: null, fileValue: 150000 },
    { broker: 'Ejemplo', symbol: 'USD', kind: 'cash', currency: 'USD', quantity: 300, avgCost: null, fileValue: 300 },
];

const CATALOG_BY_SYMBOL = (() => {
    const m = new Map();
    for (const cat of CATEGORIES) for (const c of cat.companies) m.set(c.symbol.replace(/\.BA$/, ''), c);
    return m;
})();

const linkBtn = { color: 'var(--signal-text)', textDecoration: 'underline', textUnderlineOffset: '3px', background: 'none', border: 0, cursor: 'pointer', padding: 0, font: 'inherit' };

// Cotizaciones de BYMA y dólar MEP para los tickers de la cartera. Se renuevan cada minuto.
function useMarket(symbols, enabled) {
    const key = symbols.join(',');
    const [state, setState] = useState({ data: null, failed: false });
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!enabled) return;
        let alive = true;
        const load = async () => {
            try {
                const res = await fetch(`/api/prices?symbols=${encodeURIComponent(key)}`);
                if (!res.ok) throw new Error('precios');
                const data = await res.json();
                if (alive) setState({ data, failed: Boolean(key) && !data.sourceOk });
            } catch {
                if (alive) setState((s) => ({ ...s, failed: true }));
            }
        };
        load();
        const id = setInterval(load, 60000);
        return () => { alive = false; clearInterval(id); };
    }, [key, enabled, tick]);

    return { ...state, retry: () => setTick((t) => t + 1) };
}

// Fundamentals de las empresas del catálogo (P/E, ROE, fechas de resultados).
function useFundamentals(catalogSymbols) {
    const key = catalogSymbols.join(',');
    const [map, setMap] = useState({});
    useEffect(() => {
        if (!key) return;
        let alive = true;
        fetch(`/api/portfolio-fundamentals?symbols=${encodeURIComponent(key)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => { if (alive && d?.fundamentals) setMap(d.fundamentals); })
            .catch(() => {});
        return () => { alive = false; };
    }, [key]);
    return map;
}

// ─── Piezas de la pantalla ────────────────────────────────────────────────────

function Totals({ summary, updatedAt, demo }) {
    const time = updatedAt ? new Date(updatedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : null;
    return (
        <article className="pulso-card-lg" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p className="label" style={{ color: 'var(--ink-muted)', margin: 0 }}>{demo ? 'Cartera de ejemplo' : 'Tu cartera vale'}</p>
            <p className="display" style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>{ars(summary.totalARS)}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {summary.totalUSD !== null && (
                    <span className="data" style={{ color: 'var(--ink-muted)' }}>
                        {usd(summary.totalUSD)} <span style={{ color: 'var(--ink-subtle)' }}>al dólar MEP ({ars(summary.mep)})</span>
                    </span>
                )}
                {summary.dayChangePct !== null && (
                    <span className="inline-flex items-center gap-2">
                        <Delta value={summary.dayChangePct} pill />
                        <span className="data" style={{ color: 'var(--ink-muted)' }}>
                            {summary.dayChangeARS >= 0 ? '+' : '−'}{ars(Math.abs(summary.dayChangeARS))} hoy
                        </span>
                    </span>
                )}
            </div>
            <p className="body-sm" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                {time ? `Actualizado ${time} · ` : ''}Precios de BYMA, pueden tener demora.
                {summary.pricedShare < 100 && ` El ${pct(100 - summary.pricedShare, 0)} de tu cartera se valúa con montos de tus archivos.`}
            </p>
        </article>
    );
}

function Distribution({ summary }) {
    if (summary.kinds.length === 0) return null;
    const label = summary.kinds.map((k) => `${k.label} ${pct(k.weight, 0)}`).join(', ');
    return (
        <article className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h3 className="label" style={{ color: 'var(--ink-muted)', margin: 0 }}>En qué está tu plata</h3>
            <div role="img" aria-label={`Distribución de la cartera: ${label}`} style={{ display: 'flex', height: '14px', borderRadius: 'var(--radius-pill)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                {summary.kinds.map((k) => (
                    <span key={k.kind} style={{ width: `${k.weight}%`, background: KIND_COLOR[k.kind], minWidth: k.weight > 0 ? '2px' : 0 }} />
                ))}
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2) var(--space-6)' }}>
                {summary.kinds.map((k) => (
                    <li key={k.kind} className="body-sm" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--ink-muted)' }}>
                        <span aria-hidden="true" style={{ width: '10px', height: '10px', borderRadius: '2px', background: KIND_COLOR[k.kind], border: '1px solid var(--line)' }} />
                        {k.label} <span className="data" style={{ color: 'var(--ink)' }}>{pct(k.weight, 0)}</span>
                    </li>
                ))}
            </ul>
            <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                En pesos <span className="data" style={{ color: 'var(--ink)' }}>{pct(100 - summary.usdShare, 0)}</span> · En dólares <span className="data" style={{ color: 'var(--ink)' }}>{pct(summary.usdShare, 0)}</span>
            </p>
        </article>
    );
}

function Alerts({ alerts }) {
    if (alerts.length === 0) return null;
    return (
        <article className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h3 className="label" style={{ color: 'var(--ink-muted)', margin: 0 }}>Para tener en cuenta</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {alerts.map((a) => (
                    <li key={a.id} style={{ borderLeft: '2px solid var(--signal)', paddingLeft: 'var(--space-3)' }}>
                        <p className="body" style={{ margin: 0, fontWeight: 700, color: 'var(--ink)' }}>{a.title}</p>
                        <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>{a.text}</p>
                    </li>
                ))}
            </ul>
        </article>
    );
}

function HoldingRow({ h, readOnly, onRemove }) {
    const company = CATALOG_BY_SYMBOL.get(h.symbol);
    const name = company?.name ?? (h.kind === 'cash' ? (h.symbol === 'USD' ? 'Dólares en efectivo' : 'Pesos en efectivo') : KIND_LABELS[h.kind]);
    return (
        <details style={{ borderBottom: '1px solid var(--line)' }}>
            <summary style={{ cursor: 'pointer', padding: 'var(--space-3) var(--space-4)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minHeight: '56px' }}>
                <div className="flex items-baseline justify-between gap-3">
                    <div style={{ minWidth: 0 }}>
                        <span className="body" style={{ fontWeight: 700, color: 'var(--ink)' }}>{h.symbol}</span>{' '}
                        <span className="body-sm" style={{ color: 'var(--ink-muted)' }}>{name}</span>
                    </div>
                    <span className="data" style={{ color: 'var(--ink)', whiteSpace: 'nowrap' }}>{ars(h.valueARS)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                        <span aria-hidden="true" style={{ flex: 1, maxWidth: '220px', height: '6px', background: 'var(--surface-200)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                            <span style={{ display: 'block', width: `${Math.min(100, h.weight)}%`, height: '100%', background: KIND_COLOR[h.kind] === 'var(--line)' ? 'var(--ink-subtle)' : KIND_COLOR[h.kind] }} />
                        </span>
                        <span className="data" style={{ color: 'var(--ink-muted)' }}>{pct(h.weight)}</span>
                        {h.currency === 'USD' && h.kind !== 'cash' && <span className="source-badge">US$</span>}
                        {!h.priced && <span className="source-badge">Sin precio en vivo</span>}
                    </div>
                    {h.kind !== 'cash' && Number.isFinite(h.pct) ? <Delta value={h.pct} compact /> : <span aria-hidden="true" />}
                </div>
            </summary>
            <div style={{ padding: '0 var(--space-4) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
                    <div><dt className="label" style={{ color: 'var(--ink-subtle)' }}>Cantidad total</dt><dd className="data" style={{ margin: 0 }}>{qty(h.quantity)}</dd></div>
                    {h.price !== null && <div><dt className="label" style={{ color: 'var(--ink-subtle)' }}>Precio</dt><dd className="data" style={{ margin: 0 }}>{h.currency === 'USD' ? 'US$' : '$'} {formatNumber(h.price)}{['bond', 'note', 'corp'].includes(h.kind) ? ' c/100 VN' : ''}</dd></div>}
                    {h.pnlPct !== null && <div><dt className="label" style={{ color: 'var(--ink-subtle)' }}>Resultado vs. compra</dt><dd style={{ margin: 0 }}><Delta value={h.pnlPct} /></dd></div>}
                </dl>
                <div className="overflow-x-auto">
                    <table className="w-full text-left" style={{ borderCollapse: 'collapse', minWidth: '320px' }}>
                        <thead>
                            <tr style={{ color: 'var(--ink-subtle)' }}>
                                <th scope="col" className="label" style={{ padding: 'var(--space-1) 0' }}>Broker</th>
                                <th scope="col" className="label text-right">Cantidad</th>
                                <th scope="col" className="label text-right">Valor</th>
                                <th scope="col" className="label text-right"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {h.brokers.map((b) => (
                                <tr key={b.broker} style={{ borderTop: '1px solid var(--line)' }}>
                                    <td className="body-sm" style={{ padding: 'var(--space-2) 0' }}>{b.broker}</td>
                                    <td className="data text-right">{qty(b.quantity)}</td>
                                    <td className="data text-right">{ars(b.valueARS)}</td>
                                    <td className="text-right">
                                        {!readOnly && (
                                            <button type="button" className="body-sm" style={linkBtn} onClick={() => onRemove(b.broker, h.symbol)}>
                                                Quitar<span className="sr-only"> {h.symbol} de {b.broker}</span>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {company && (
                    <Link href={`/Empresas/${encodeURIComponent(company.symbol)}`} className="body-sm" style={{ ...linkBtn, alignSelf: 'flex-start' }}>
                        Ver ficha de {company.name}
                    </Link>
                )}
            </div>
        </details>
    );
}

function AddForm({ onAdd, onClose }) {
    const [ticker, setTicker] = useState('');
    const [amount, setAmount] = useState('');
    const [broker, setBroker] = useState('Manual');
    const [cost, setCost] = useState('');
    const [value, setValue] = useState('');
    const [needsValue, setNeedsValue] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setError('');
        const symbol = ticker.trim().toUpperCase().replace(/\.BA$/, '');
        const quantity = Number(String(amount).replace(',', '.'));
        if (!/^[A-Z0-9]{2,12}$/.test(symbol)) return setError('Escribí un ticker válido, por ejemplo GGAL, AAPL o AL30.');
        if (!Number.isFinite(quantity) || quantity <= 0) return setError('La cantidad tiene que ser mayor a cero.');
        const avgCost = cost === '' ? null : Number(String(cost).replace(',', '.'));
        if (avgCost !== null && (!Number.isFinite(avgCost) || avgCost < 0)) return setError('El precio de compra no es válido.');

        setBusy(true);
        let ok = false;
        if (symbol === 'ARS' || symbol === 'USD') {
            ok = await onAdd({ broker, symbol, kind: 'cash', currency: symbol, quantity, avgCost: null, fileValue: quantity });
        } else {
            let quote = null;
            try {
                const res = await fetch(`/api/prices?symbols=${symbol}`);
                quote = (await res.json()).quotes?.[symbol] ?? null;
            } catch { /* se informa abajo */ }
            if (quote) {
                ok = await onAdd({ broker, symbol, kind: quote.kind, currency: quote.currency, quantity, avgCost, fileValue: null });
            } else {
                const manual = value === '' ? null : Number(String(value).replace(',', '.'));
                if (!needsValue || manual === null || !Number.isFinite(manual) || manual <= 0) {
                    setNeedsValue(true);
                    setBusy(false);
                    return setError(`No encontramos ${symbol} en BYMA. Si es un fondo u otro activo, cargá cuánto vale en pesos y lo sumamos con ese monto.`);
                }
                ok = await onAdd({ broker, symbol, kind: 'other', currency: 'ARS', quantity, avgCost: null, fileValue: manual });
            }
        }
        setBusy(false);
        if (ok) { track('manual_add'); setTicker(''); setAmount(''); setCost(''); setValue(''); setNeedsValue(false); onClose(); }
        else setError('No pudimos guardar el activo. Probá de nuevo.');
    }

    return (
        <form onSubmit={submit} className="pulso-card-lg" aria-label="Agregar un activo" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="h2" style={{ margin: 0 }}>Agregar un activo</h2>
                    <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 'var(--space-1) 0 0 0' }}>
                        Para pesos o dólares en efectivo, escribí ARS o USD como ticker.
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-3)' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <span className="label" style={{ color: 'var(--ink-muted)' }}>Ticker</span>
                    <input className="pulso-input" value={ticker} onChange={(e) => setTicker(e.target.value)} autoCapitalize="characters" autoComplete="off" required />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <span className="label" style={{ color: 'var(--ink-muted)' }}>Cantidad</span>
                    <input className="pulso-input" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" autoComplete="off" required />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <span className="label" style={{ color: 'var(--ink-muted)' }}>Broker</span>
                    <select className="pulso-input" style={{ fontFamily: 'var(--font-display)' }} value={broker} onChange={(e) => setBroker(e.target.value)}>
                        <option value="Manual">Manual</option>
                        {BROKERS.filter((b) => b.id !== 'Otro').map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
                    </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <span className="label" style={{ color: 'var(--ink-muted)' }}>Precio de compra (opcional)</span>
                    <input className="pulso-input" value={cost} onChange={(e) => setCost(e.target.value)} inputMode="decimal" autoComplete="off" />
                </label>
            </div>
            {needsValue && (
                <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', maxWidth: '320px' }}>
                    <span className="label" style={{ color: 'var(--ink-muted)' }}>Valor total en pesos</span>
                    <input className="pulso-input" value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" autoComplete="off" />
                </label>
            )}
            {error && <p role="alert" className="body-sm" style={{ margin: 0, padding: 'var(--space-3) var(--space-4)', background: 'var(--surface-200)', borderLeft: '2px solid var(--signal)', borderRadius: 'var(--radius-sm)', color: 'var(--ink)' }}>{error}</p>}
            <div><Button type="submit" loading={busy} loadingText="Buscando…">Agregar a mi cartera</Button></div>
        </form>
    );
}

function Advanced({ catalogHoldings, fundamentals, coverage }) {
    const metrics = useMemo(
        () => calculatePortfolioMetrics(catalogHoldings.map((h) => ({ symbol: h.catalogSymbol, weight: h.valueARS })), fundamentals),
        [catalogHoldings, fundamentals]
    );
    const tiles = [
        ['P/E ponderado', metrics.weightedPE, 'x', 1],
        ['ROE ponderado', metrics.weightedROE, ' %', 1],
        ['Dividendos', metrics.weightedDividendYield, ' %', 2],
        ['Beta', metrics.weightedBeta, '', 2],
        ['Potencial según analistas', metrics.weightedUpside, ' %', 1],
    ];
    return (
        <details className="pulso-card" style={{ padding: 0 }}>
            <summary className="body" style={{ cursor: 'pointer', padding: 'var(--space-4) var(--space-6)', fontWeight: 700, minHeight: '56px', display: 'flex', alignItems: 'center' }}>
                Análisis de tus empresas <span className="body-sm" style={{ fontWeight: 400, color: 'var(--ink-muted)', marginLeft: 'var(--space-3)' }}>cubre el {pct(coverage, 0)} de tu cartera</span>
            </summary>
            <div style={{ padding: '0 var(--space-6) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                    Promedios ponderados de las empresas de tu cartera que Infopeso analiza ({catalogHoldings.map((h) => h.symbol).join(', ')}). No incluye bonos, efectivo ni otros activos.
                    {metrics.roeExcluded?.length > 0 && ` El ROE no incluye ${metrics.roeExcluded.join(', ')}: supera el 100 % y distorsionaría el promedio.`}
                </p>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)' }}>
                    {tiles.map(([label, value, unit, d]) => (
                        <div key={label}>
                            <dt className="label" style={{ color: 'var(--ink-subtle)' }}>{label}</dt>
                            <dd className="figure" style={{ margin: 0, fontSize: '26px' }}>{value === null || value === undefined ? '—' : `${formatNumber(value, { minimumFractionDigits: d, maximumFractionDigits: d })}${unit}`}</dd>
                        </div>
                    ))}
                </dl>
                {metrics.diagnostics.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {metrics.diagnostics.map((d) => (
                            <li key={d.title} style={{ borderLeft: '2px solid var(--line)', paddingLeft: 'var(--space-3)' }}>
                                <p className="body-sm" style={{ margin: 0, fontWeight: 700, color: 'var(--ink)' }}>{d.title}</p>
                                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>{d.desc}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </details>
    );
}

function EmptyState({ onImport, onAdd, onDemo }) {
    return (
        <section className="pulso-card-lg" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <h2 className="h2" style={{ margin: 0 }}>Armá tu cartera en un minuto</h2>
            <p className="body" style={{ color: 'var(--ink-muted)', margin: 0, maxWidth: '60ch' }}>
                Importá la tenencia de tu broker (podés sumar varios) o cargá tus activos a mano. Te mostramos cuánto vale en pesos y dólares, en qué está tu plata y qué mirar.
            </p>
            <div className="flex flex-wrap gap-3">
                <Button onClick={onImport}>Importar desde mi broker</Button>
                <Button variant="secondary" onClick={onAdd}>Agregar un activo a mano</Button>
                <Button variant="ghost" onClick={onDemo}>Ver una cartera de ejemplo</Button>
            </div>
        </section>
    );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

export default function CarteraReal({ intent = null }) {
    const store = usePositions();
    const [panel, setPanel] = useState(null); // 'import' | 'add' | null
    const [demo, setDemo] = useState(false);

    // Enlaces de la presentación (#importar, #agregar, #ejemplo, ver CarteraApp): abren el panel o el ejemplo.
    const [handledIntent, setHandledIntent] = useState(null);
    if (intent && intent !== handledIntent) {
        setHandledIntent(intent);
        setDemo(intent.type === 'ejemplo');
        setPanel(intent.type === 'importar' ? 'import' : intent.type === 'agregar' ? 'add' : null);
    }

    // Con cartera cargada, la próxima visita abre directo en el tablero (sin la presentación de arriba).
    useEffect(() => {
        if (store.positions !== null) rememberPortfolio(store.positions.length > 0);
    }, [store.positions]);

    const positions = demo ? DEMO : store.positions;
    const loaded = positions !== null;
    const symbols = useMemo(() => [...new Set((positions ?? []).filter((p) => p.kind !== 'cash').map((p) => p.symbol))], [positions]);
    const market = useMarket(symbols, loaded && positions.length > 0);
    const summary = useMemo(() => summarize(positions ?? [], market.data?.quotes ?? {}, market.data?.mep ?? null), [positions, market.data]);

    const catalogHoldings = useMemo(
        () => summary.holdings
            .filter((h) => (h.kind === 'stock' || h.kind === 'cedear') && CATALOG_BY_SYMBOL.has(h.symbol))
            .map((h) => ({ ...h, catalogSymbol: CATALOG_BY_SYMBOL.get(h.symbol).symbol })),
        [summary]
    );
    const fundamentals = useFundamentals(useMemo(() => catalogHoldings.map((h) => h.catalogSymbol), [catalogHoldings]));
    const earnings = useMemo(() => {
        const out = {};
        for (const h of catalogHoldings) {
            const d = fundamentals[h.catalogSymbol]?.nextEarningsDate;
            if (d) out[h.symbol] = new Date(d).getTime();
        }
        return out;
    }, [catalogHoldings, fundamentals]);
    const alerts = useMemo(() => buildAlerts(summary, earnings), [summary, earnings]);
    const coverage = summary.totalARS > 0 ? (catalogHoldings.reduce((s, h) => s + h.valueARS, 0) / summary.totalARS) * 100 : 0;
    const newsHoldings = useMemo(() => catalogHoldings.map((h) => ({ symbol: h.catalogSymbol, weight: h.valueARS })), [catalogHoldings]);

    // Medición del embudo: una vez por carga de página, cuando ya se sabe si hay sesión.
    useEffect(() => {
        if (!loaded) return;
        trackOnce('cartera_view', { logged: Boolean(store.user) });
        if (new URLSearchParams(window.location.search).get('ref') === 'resumen') trackOnce('email_visit');
    }, [loaded, store.user]);

    // Punto de "ahora" para el gráfico de evolución: solo si los precios de hoy ya cargaron bien.
    const live = !demo && market.data && !market.failed && summary.totalARS > 0 && summary.pricedShare >= 99
        ? { ars: summary.totalARS, usd: summary.totalUSD }
        : null;

    if (!loaded) return <main style={{ minHeight: '60vh' }} aria-busy="true" />;

    const empty = positions.length === 0;
    const brokers = brokersOf(positions);
    const stopDemo = () => setDemo(false);

    return (
        <main style={{ paddingBottom: 'var(--space-16)' }}>
            <section style={{ padding: 'var(--space-6) 0' }}>
                <div className="pulso-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {!demo && store.enabled && (
                        <CarteraAccountBar user={store.user} syncState={store.sync} imported={store.imported} onRetry={store.retry} />
                    )}

                    {demo && (
                        <p role="status" className="body-sm" style={{ margin: 0, padding: 'var(--space-3) var(--space-4)', background: 'var(--surface-200)', borderLeft: '2px solid var(--signal)', borderRadius: 'var(--radius-sm)' }}>
                            Estás viendo una cartera de ejemplo, no son tus datos.{' '}
                            <button type="button" style={linkBtn} onClick={() => { stopDemo(); setPanel('import'); }}>Importar la mía</button>
                            {' · '}
                            <button type="button" style={linkBtn} onClick={stopDemo}>Salir del ejemplo</button>
                        </p>
                    )}

                    {market.failed && !empty && (
                        <p role="status" className="body-sm" style={{ margin: 0, padding: 'var(--space-3) var(--space-4)', background: 'var(--surface-200)', borderLeft: '2px solid var(--signal)', borderRadius: 'var(--radius-sm)' }}>
                            No pudimos traer los precios de BYMA ahora. Mostramos los montos de tus archivos.{' '}
                            <button type="button" style={linkBtn} onClick={market.retry}>Reintentar</button>
                        </p>
                    )}

                    {!empty && !demo && (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                                {brokers.length} {brokers.length === 1 ? 'broker' : 'brokers'}: {brokers.join(', ')}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button size="sm" onClick={() => setPanel('import')}>Importar desde mi broker</Button>
                                <Button size="sm" variant="secondary" onClick={() => setPanel('add')}>Agregar un activo</Button>
                            </div>
                        </div>
                    )}

                    {panel === 'import' && <ImportPanel existing={positions} onImport={store.importBroker} onClose={() => setPanel(null)} />}
                    {panel === 'add' && <AddForm onAdd={store.add} onClose={() => setPanel(null)} />}

                    {empty && !panel && <EmptyState onImport={() => setPanel('import')} onAdd={() => setPanel('add')} onDemo={() => { track('demo_view'); setDemo(true); }} />}

                    {!empty && (
                        <>
                            <Totals summary={summary} updatedAt={market.data?.updatedAt} demo={demo} />

                            <Evolution user={store.user} enabled={store.enabled} live={live} demo={demo} />

                            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-4)', alignItems: 'start' }}>
                                <Distribution summary={summary} />
                                <Alerts alerts={alerts} />
                            </div>

                            <section aria-label="Tus activos">
                                <div className="section-head"><h2 className="h2" style={{ margin: 0 }}>Tus activos</h2><span className="body-sm" style={{ color: 'var(--ink-subtle)' }}>{summary.holdings.length}</span></div>
                                <div style={{ background: 'var(--surface-100)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                    {summary.holdings.map((h) => (
                                        <HoldingRow key={h.symbol} h={h} readOnly={demo} onRemove={store.remove} />
                                    ))}
                                </div>
                            </section>

                            {catalogHoldings.length > 0 && <Advanced catalogHoldings={catalogHoldings} fundamentals={fundamentals} coverage={coverage} />}

                            {newsHoldings.length > 0 && <BloombergNewsSlider holdings={newsHoldings} />}

                            {!demo && (
                                <details>
                                    <summary className="body-sm" style={{ cursor: 'pointer', color: 'var(--ink-muted)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>Administrar mis datos</summary>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
                                        {brokers.map((b) => (
                                            <p key={b} className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                                                {b}: {positions.filter((p) => p.broker === b).length} posiciones.{' '}
                                                <button type="button" style={linkBtn} onClick={() => { if (window.confirm(`¿Quitar todas las posiciones de ${b}?`)) store.importBroker(b, []); }}>Quitar este broker</button>
                                            </p>
                                        ))}
                                        <div>
                                            <Button variant="secondary" size="sm" onClick={() => { if (window.confirm('¿Vaciar toda tu cartera? No se puede deshacer.')) store.clear(); }}>Vaciar toda la cartera</Button>
                                        </div>
                                    </div>
                                </details>
                            )}
                        </>
                    )}

                    <p className="body-sm" style={{ margin: 0, color: 'var(--ink-subtle)' }}>
                        Información con fines informativos. No es una recomendación de inversión.
                    </p>
                </div>
            </section>
        </main>
    );
}
