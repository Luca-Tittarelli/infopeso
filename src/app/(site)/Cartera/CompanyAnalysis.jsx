'use client';

import { useMemo, useState } from 'react';
import { Delta } from '@/components/pulso/Delta';
import { formatNumber, formatDeltaText, MINUS_SIGN } from '@/utils/formatters';
import { analyzeCompanies, CONSENSUS_LABELS } from '@/lib/portfolio/analysis';

// ─── Utilidades ───────────────────────────────────────────────────────────────

const DAY = 86400000;
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const num = (n, d = 1) => formatNumber(n, { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, MINUS_SIGN);
// Espacio no separable antes de "%": en pantallas chicas el número y el signo no se separan de línea.
const pct = (n, d = 1) => `${num(n, d)}\u00a0%`;
const ars = (n) => `$ ${num(n, 0)}`;
const usd = (n) => `US$ ${num(n, 0)}`;
const money = (n, currency) => {
    const d = Math.abs(n) < 100 ? 2 : 0;
    if (currency === 'ARS') return `$ ${num(n, d)}`;
    return `${currency === 'USD' || !currency ? 'US$' : currency} ${num(n, d)}`;
};
const shortDate = (ms) => new Date(ms).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
const longDate = (ms) => new Date(ms).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });

const linkBtn = { color: 'var(--signal-text)', textDecoration: 'underline', textUnderlineOffset: '3px', background: 'none', border: 0, cursor: 'pointer', padding: 0, font: 'inherit', alignSelf: 'flex-start' };
const note = { margin: 0, color: 'var(--ink-subtle)' };

// El color acompaña siempre a un texto ("Optimista", "Pesimista"): nunca es el único dato.
const CONSENSUS_COLOR = { positive: 'var(--signal)', neutral: 'var(--ink-subtle)', negative: 'var(--down)', none: 'var(--surface-200)' };
const CONSENSUS_TEXT = { positive: 'var(--signal-text)', neutral: 'var(--ink-muted)', negative: 'var(--down)' };

function Card({ title, aside, children }) {
    return (
        <article className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: 0 }}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="label" style={{ color: 'var(--ink-muted)', margin: 0 }}>{title}</h3>
                {aside && <span className="body-sm" style={{ color: 'var(--ink-subtle)' }}>{aside}</span>}
            </div>
            {children}
        </article>
    );
}

function StackedBar({ segments, label }) {
    return (
        <div role="img" aria-label={label} style={{ display: 'flex', height: '12px', borderRadius: 'var(--radius-pill)', overflow: 'hidden', border: '1px solid var(--line)' }}>
            {segments.map((s) => (
                <span key={s.key} style={{ width: `${s.weight}%`, background: s.color, minWidth: s.weight > 0 ? '2px' : 0 }} />
            ))}
        </div>
    );
}

function Legend({ segments }) {
    return (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2) var(--space-4)' }}>
            {segments.map((s) => (
                <li key={s.key} className="body-sm" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--ink-muted)' }}>
                    <span aria-hidden="true" style={{ width: '10px', height: '10px', borderRadius: '2px', background: s.color, border: '1px solid var(--line)' }} />
                    {s.label} <span className="data" style={{ color: 'var(--ink)' }}>{pct(s.weight, 0)}</span>
                </li>
            ))}
        </ul>
    );
}

// ─── En pocas palabras ────────────────────────────────────────────────────────

function Observations({ items }) {
    return (
        <Card title="En pocas palabras">
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4) var(--space-6)' }}>
                {items.map((o) => (
                    <li key={o.id} style={{ borderLeft: '2px solid var(--signal)', paddingLeft: 'var(--space-3)' }}>
                        <p className="body" style={{ margin: 0, fontWeight: 700, color: 'var(--ink)' }}>{o.title}</p>
                        <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>{o.text}</p>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

// ─── Indicadores ponderados ───────────────────────────────────────────────────

const GROUPS = [
    {
        title: 'Valuación',
        items: [
            { key: 'pe', label: 'P/E actual', unit: 'x', help: 'Cuántos años de las ganancias actuales se pagan con el precio de hoy.' },
            { key: 'forwardPe', label: 'P/E futuro', unit: 'x', help: 'Lo mismo, con las ganancias que esperan los analistas para los próximos 12 meses.' },
            { key: 'pb', label: 'Precio / valor libros', unit: 'x', d: 2, help: 'Cuánto se paga por cada peso de patrimonio contable de las empresas.' },
        ],
    },
    {
        title: 'Rentabilidad',
        items: [
            { key: 'roe', label: 'ROE', unit: '%', help: 'Ganancia anual por cada $ 100 de patrimonio de los accionistas.' },
            { key: 'operatingMargin', label: 'Margen operativo', unit: '%', help: 'De cada $ 100 que venden, cuánto queda después de los costos del negocio.' },
            { key: 'profitMargin', label: 'Margen neto', unit: '%', help: 'De cada $ 100 que venden, cuánto queda como ganancia final.' },
        ],
    },
    {
        title: 'Riesgo e ingresos',
        items: [
            { key: 'beta', label: 'Beta', unit: '', d: 2, usd: true, help: 'Cuánto se movieron frente al S&P 500 (1 = igual que el mercado). Solo acciones que cotizan en dólares.' },
            { key: 'dividendYield', label: 'Dividendos', unit: '%', d: 2, help: 'Lo que pagaron en el último año, sobre el precio de hoy.' },
            { key: 'upside', label: 'Potencial según analistas', unit: 'delta', usd: true, help: 'Distancia al precio objetivo promedio a 12 meses. Solo acciones en dólares con 3 o más analistas.' },
        ],
    },
];

const formatMetric = (value, { unit, d = 1 }) => {
    if (!finite(value)) return '—';
    if (unit === 'x') return `${num(value, d)}x`;
    if (unit === '%') return pct(value, d);
    if (unit === 'delta') return formatDeltaText(value, { decimals: d });
    return num(value, d);
};

function Indicators({ metrics }) {
    return (
        <Card title="Indicadores de tus empresas" aside="Promedios ponderados por valor">
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
                {GROUPS.map((g) => (
                    <section key={g.title} aria-label={g.title} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <h4 className="body" style={{ margin: 0, fontWeight: 700, color: 'var(--ink)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--line)' }}>{g.title}</h4>
                        <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {g.items.map((item) => {
                                const m = metrics[item.key];
                                const base = item.usd ? 'de tus acciones en dólares' : 'de tus acciones';
                                return (
                                    <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                        <dt className="label" style={{ color: 'var(--ink-subtle)' }}>{item.label}</dt>
                                        <dd style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                            <span className="figure" style={{ fontSize: '28px' }}>{formatMetric(m.value, item)}</span>
                                            <span className="body-sm" style={{ color: 'var(--ink-muted)' }}>{item.help}</span>
                                            {m.value !== null && m.count >= 2 && item.key !== 'dividendYield' && (
                                                <span className="body-sm" style={note}>
                                                    Va de {formatMetric(m.min.value, item)} ({m.min.symbol}) a {formatMetric(m.max.value, item)} ({m.max.symbol})
                                                </span>
                                            )}
                                            {m.value !== null && m.count === 1 && (
                                                <span className="body-sm" style={note}>Solo hay dato de {m.min.symbol}.</span>
                                            )}
                                            {m.value !== null && m.count > 1 && m.coverage < 90 && (
                                                <span className="body-sm" style={note}>Con datos del {pct(m.coverage, 0)} {base}.</span>
                                            )}
                                            {m.value === null && (
                                                <span className="body-sm" style={note}>Sin datos suficientes {base}.</span>
                                            )}
                                            {item.key === 'roe' && m.excluded.length > 0 && (
                                                <span className="body-sm" style={note}>No incluye {m.excluded.join(', ')}: supera ±100 % y distorsionaría el promedio.</span>
                                            )}
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>
                    </section>
                ))}
            </div>
        </Card>
    );
}

// ─── Analistas ────────────────────────────────────────────────────────────────

// Rango de precios objetivo (mínimo a máximo), el objetivo promedio y el precio de hoy en una misma escala.
function TargetRange({ r }) {
    const low = finite(r.targetLow) ? r.targetLow : r.targetMean;
    const high = finite(r.targetHigh) ? r.targetHigh : r.targetMean;
    const lo = Math.min(low, r.price);
    const hi = Math.max(high, r.price);
    const x = (v) => (hi > lo ? ((v - lo) / (hi - lo)) * 100 : 50);
    return (
        <div aria-hidden="true" style={{ position: 'relative', height: '14px', margin: '0 5px' }}>
            <span style={{ position: 'absolute', left: 0, right: 0, top: '6px', height: '2px', background: 'var(--surface-200)' }} />
            <span style={{ position: 'absolute', left: `${x(low)}%`, width: `${Math.max(0.5, x(high) - x(low))}%`, top: '4px', height: '6px', borderRadius: '3px', background: 'var(--ink-subtle)', opacity: 0.45 }} />
            <span style={{ position: 'absolute', left: `calc(${x(r.targetMean)}% - 1px)`, top: '1px', width: '2px', height: '12px', background: 'var(--ink)' }} />
            <span style={{ position: 'absolute', left: `calc(${x(r.price)}% - 5px)`, top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--signal)', boxShadow: '0 0 0 2px var(--surface-100)' }} />
        </div>
    );
}

function Analysts({ a }) {
    const [all, setAll] = useState(false);
    const segments = [
        { key: 'positive', label: CONSENSUS_LABELS.positive },
        { key: 'neutral', label: CONSENSUS_LABELS.neutral },
        { key: 'negative', label: CONSENSUS_LABELS.negative },
        { key: 'none', label: 'Sin consenso' },
    ]
        .map((s) => ({ ...s, weight: a.consensus[s.key], color: CONSENSUS_COLOR[s.key] }))
        .filter((s) => s.weight >= 0.5);
    const covered = a.rows
        .filter((r) => finite(r.targetMean) && finite(r.price) && r.analysts > 0)
        .sort((x, y) => y.valueARS - x.valueARS);
    const shown = all ? covered : covered.slice(0, 5);
    const upside = a.metrics.upside.value;

    return (
        <Card title="Qué dicen los analistas" aside="Fuente: Yahoo Finance">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>Consenso de cada empresa, según cuánto pesa en tus acciones.</p>
                <StackedBar segments={segments} label={`Consenso de analistas: ${segments.map((s) => `${s.label} ${pct(s.weight, 0)}`).join(', ')}`} />
                <Legend segments={segments} />
            </div>

            {upside !== null && (
                <div>
                    <p className="label" style={{ margin: 0, color: 'var(--ink-subtle)' }}>Potencial promedio en dólares</p>
                    <p className="figure" style={{ margin: 0, fontSize: '28px', color: upside >= 0 ? 'var(--signal-text)' : 'var(--down)' }}>{formatDeltaText(upside, { decimals: 1 })}</p>
                    <p className="body-sm" style={note}>Hasta el precio objetivo promedio a 12 meses.</p>
                </div>
            )}

            {covered.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <p className="body-sm" style={{ ...note, display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1) var(--space-4)' }}>
                        <span><span aria-hidden="true" style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: 'var(--signal)', marginRight: '6px' }} />Precio de hoy</span>
                        <span><span aria-hidden="true" style={{ display: 'inline-block', width: '2px', height: '11px', background: 'var(--ink)', marginRight: '6px', verticalAlign: '-1px' }} />Objetivo promedio</span>
                        <span><span aria-hidden="true" style={{ display: 'inline-block', width: '16px', height: '6px', borderRadius: '3px', background: 'var(--ink-subtle)', opacity: 0.45, marginRight: '6px' }} />Del más bajo al más alto</span>
                    </p>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {shown.map((r) => (
                            <li key={r.symbol} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="body-sm" style={{ color: 'var(--ink-muted)' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{r.symbol}</span>{' '}
                                        {r.consensus && <span style={{ color: CONSENSUS_TEXT[r.consensus], fontWeight: 600 }}>{CONSENSUS_LABELS[r.consensus]}</span>}
                                        {r.consensus && ' · '}
                                        {r.analysts} {r.analysts === 1 ? 'analista' : 'analistas'}
                                    </span>
                                    {r.upside !== null && <Delta value={r.upside} decimals={1} compact />}
                                </div>
                                <TargetRange r={r} />
                                <p className="data" style={{ ...note, fontSize: '12px' }}>
                                    Hoy {money(r.price, r.currency)} · objetivo {money(r.targetMean, r.currency)}
                                    {finite(r.targetLow) && finite(r.targetHigh) && ` (${money(r.targetLow, r.currency)} a ${money(r.targetHigh, r.currency)})`}
                                    {r.currency === 'ARS' && ' · en pesos'}
                                </p>
                            </li>
                        ))}
                    </ul>
                    {covered.length > 5 && (
                        <button type="button" className="body-sm" style={linkBtn} onClick={() => setAll((v) => !v)} aria-expanded={all}>
                            {all ? 'Ver menos' : `Ver las ${covered.length} empresas con cobertura`}
                        </button>
                    )}
                </div>
            )}

            <p className="body-sm" style={note}>
                Son opiniones de terceros relevadas por Yahoo Finance, no recomendaciones de Infopeso. En acciones argentinas los objetivos están en pesos e incluyen la inflación esperada.
            </p>
        </Card>
    );
}

// ─── Sectores y regiones ──────────────────────────────────────────────────────

function Sectors({ a }) {
    const regionColor = { Argentina: 'var(--signal)', Exterior: 'var(--down)' };
    const regions = a.regions.map((r) => ({ key: r.name, label: r.name, weight: r.weight, color: regionColor[r.name] }));
    return (
        <Card title="Sectores y regiones">
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {a.sectors.map((s) => (
                    <li key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="body-sm" style={{ color: 'var(--ink)', fontWeight: 600 }}>{s.name}</span>
                            <span className="data" style={{ color: 'var(--ink)' }}>{pct(s.weight, 0)}</span>
                        </div>
                        <span aria-hidden="true" style={{ display: 'block', height: '6px', background: 'var(--surface-200)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                            <span style={{ display: 'block', width: `${s.weight}%`, height: '100%', background: 'var(--ink-muted)' }} />
                        </span>
                        <span className="body-sm" style={{ ...note, fontSize: '12px' }}>
                            {a.rows.filter((r) => r.sector === s.name).sort((x, y) => y.valueARS - x.valueARS).map((r) => r.symbol).join(', ')}
                        </span>
                    </li>
                ))}
            </ul>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <p className="label" style={{ margin: 0, color: 'var(--ink-subtle)' }}>Dónde operan</p>
                <StackedBar segments={regions} label={`Región: ${regions.map((r) => `${r.label} ${pct(r.weight, 0)}`).join(', ')}`} />
                <Legend segments={regions} />
            </div>
        </Card>
    );
}

// ─── Próximas fechas ──────────────────────────────────────────────────────────

const EVENT_LABELS = {
    earnings: 'Presenta resultados',
    exDividend: 'Fecha de corte del dividendo',
    dividend: 'Paga dividendo',
};

function inDays(ms) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const n = Math.round((ms - today.getTime()) / DAY);
    if (n <= 0) return 'hoy';
    if (n === 1) return 'mañana';
    return `en ${n} días`;
}

function Calendar({ events }) {
    const [all, setAll] = useState(false);
    const shown = all ? events : events.slice(0, 6);
    return (
        <Card title="Próximas fechas" aside="Próximos 90 días">
            {events.length === 0 ? (
                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>Tus empresas no tienen fechas anunciadas en los próximos 90 días.</p>
            ) : (
                <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {shown.map((e) => (
                        <li key={`${e.type}-${e.symbol}-${e.date}`} style={{ display: 'grid', gridTemplateColumns: '96px 1fr auto', alignItems: 'baseline', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--line)' }}>
                            <span className="data" style={{ color: 'var(--ink)' }}>{longDate(e.date)}</span>
                            <span className="body-sm" style={{ color: 'var(--ink-muted)', minWidth: 0 }}>
                                <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{e.symbol}</span> {EVENT_LABELS[e.type]}
                            </span>
                            <span className="body-sm" style={{ color: 'var(--ink-subtle)', whiteSpace: 'nowrap' }}>{inDays(e.date)}</span>
                        </li>
                    ))}
                </ol>
            )}
            {events.length > 6 && (
                <button type="button" className="body-sm" style={linkBtn} onClick={() => setAll((v) => !v)} aria-expanded={all}>
                    {all ? 'Ver menos' : `Ver las ${events.length} fechas`}
                </button>
            )}
            <p className="body-sm" style={note}>
                Fechas informadas por Yahoo Finance; las de resultados pueden ser estimadas. Para cobrar un dividendo hay que tener la acción antes de la fecha de corte (en CEDEARs, la fecha local puede ser distinta).
            </p>
        </Card>
    );
}

// ─── Dividendos ───────────────────────────────────────────────────────────────

function Dividends({ a }) {
    const d = a.dividends;
    const yieldMetric = a.metrics.dividendYield;
    return (
        <Card title="Dividendos estimados" aside="Próximos 12 meses">
            {d.payers.length === 0 ? (
                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                    {d.reported > 0 ? 'Ninguna de tus empresas pagó dividendos en el último año, según Yahoo Finance.' : 'Todavía no hay datos de dividendos para tus empresas.'}
                </p>
            ) : (
                <>
                    <div>
                        <p className="figure" style={{ margin: 0, fontSize: '32px' }}>
                            {d.yearlyUSD !== null ? usd(d.yearlyUSD) : ars(d.yearlyARS)}
                            <span className="body" style={{ fontWeight: 400, color: 'var(--ink-muted)', letterSpacing: 0 }}> por año</span>
                        </p>
                        <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                            {d.yearlyUSD !== null ? `Unos ${usd(d.yearlyUSD / 12)} por mes · ${ars(d.yearlyARS)} al dólar MEP` : `Unos ${ars(d.yearlyARS / 12)} por mes`}
                        </p>
                        <p className="body-sm" style={note}>
                            {yieldMetric.value !== null && `Rendimiento ponderado ${pct(yieldMetric.value, 2)} · `}
                            Pagan {d.payers.length} de {a.rows.length} empresas
                        </p>
                    </div>
                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <caption className="sr-only">Dividendos estimados por empresa</caption>
                        <thead>
                            <tr style={{ color: 'var(--ink-subtle)' }}>
                                <th scope="col" className="label text-left" style={{ padding: 'var(--space-1) 0', fontWeight: 500 }}>Empresa</th>
                                <th scope="col" className="label text-right" style={{ fontWeight: 500 }}>Rinde</th>
                                <th scope="col" className="label text-right" style={{ fontWeight: 500 }}>Por año</th>
                            </tr>
                        </thead>
                        <tbody>
                            {d.payers.slice(0, 6).map((p) => (
                                <tr key={p.symbol} style={{ borderTop: '1px solid var(--line)' }}>
                                    <td className="body-sm" style={{ padding: 'var(--space-2) 0' }}><span style={{ fontWeight: 700 }}>{p.symbol}</span> <span style={{ color: 'var(--ink-subtle)' }}>{p.name}</span></td>
                                    <td className="data text-right">{pct(p.yield, 2)}</td>
                                    <td className="data text-right">{p.yearlyUSD !== null ? usd(p.yearlyUSD) : ars(p.yearlyARS)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
            <p className="body-sm" style={note}>
                Estimación con lo pagado en los últimos 12 meses sobre el valor de hoy, antes de impuestos y retenciones. Las empresas pueden cambiar o suspender sus pagos.
            </p>
        </Card>
    );
}

// ─── Empresa por empresa ──────────────────────────────────────────────────────

const CONSENSUS_RANK = { positive: 3, neutral: 2, negative: 1 };
const validPe = (pe) => (finite(pe) && pe > 0 && pe < 250 ? pe : null);
const dash = <span style={{ color: 'var(--ink-subtle)' }}>—</span>;

const COLUMNS = [
    { key: 'symbol', label: 'Empresa', value: (r) => r.symbol, dir: 'asc', align: 'left' },
    { key: 'weight', label: 'Peso', value: (r) => r.portfolioWeight },
    { key: 'dayPct', label: 'Hoy', value: (r) => r.dayPct },
    { key: 'pe', label: 'P/E', value: (r) => validPe(r.pe) },
    { key: 'roe', label: 'ROE', value: (r) => r.roe },
    { key: 'profitMargin', label: 'Margen neto', value: (r) => r.profitMargin },
    { key: 'dividendYield', label: 'Dividendo', value: (r) => r.dividendYield },
    { key: 'consensus', label: 'Analistas', value: (r) => CONSENSUS_RANK[r.consensus] ?? null },
    { key: 'upside', label: 'Potencial', value: (r) => r.upside },
    { key: 'range', label: '52 semanas', value: (r) => r.range?.fromHigh ?? null },
    { key: 'nextEarnings', label: 'Resultados', value: (r) => r.nextEarnings, dir: 'asc' },
];

function RangeCell({ range }) {
    if (!range) return dash;
    const atHigh = range.fromHigh > -0.5;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <span aria-hidden="true" style={{ position: 'relative', width: '56px', height: '6px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-200)' }}>
                <span style={{ position: 'absolute', left: `calc(${range.position * 100}% - 4px)`, top: '-1px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ink)' }} />
            </span>
            <span className="data" style={{ minWidth: '44px', textAlign: 'right' }}>{atHigh ? 'máx.' : formatDeltaText(range.fromHigh, { decimals: 0 })}</span>
        </span>
    );
}

function Cell({ col, r }) {
    switch (col.key) {
        case 'symbol':
            return (
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="body-sm" style={{ fontWeight: 700, color: 'var(--ink)' }}>{r.symbol}</span>
                    <span style={{ fontSize: '12px', color: 'var(--ink-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{r.name}</span>
                </span>
            );
        case 'weight': return pct(r.portfolioWeight);
        case 'dayPct': return r.dayPct === null ? dash : <Delta value={r.dayPct} compact />;
        case 'pe': return validPe(r.pe) === null ? dash : `${num(r.pe)}x`;
        case 'roe':
        case 'profitMargin': return finite(r[col.key]) ? pct(r[col.key]) : dash;
        case 'dividendYield':
            if (r.dividendYield === null) return dash;
            return r.dividendYield === 0 ? <span style={{ color: 'var(--ink-subtle)' }}>No paga</span> : pct(r.dividendYield, 2);
        case 'consensus':
            if (!r.consensus) return dash;
            return (
                <span>
                    <span style={{ color: CONSENSUS_TEXT[r.consensus], fontWeight: 600 }}>{CONSENSUS_LABELS[r.consensus]}</span>
                    <span style={{ color: 'var(--ink-subtle)' }}> ({r.analysts})</span>
                </span>
            );
        case 'upside':
            if (r.upside === null) return dash;
            return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <Delta value={r.upside} decimals={1} compact />
                    {r.currency === 'ARS' && <span style={{ fontSize: '11px', color: 'var(--ink-subtle)' }} title="Precio objetivo en pesos">en $</span>}
                </span>
            );
        case 'range': return <RangeCell range={r.range} />;
        case 'nextEarnings': return r.nextEarnings ? shortDate(r.nextEarnings) : dash;
        default: return null;
    }
}

// La columna de la empresa queda fija al desplazar la tabla en pantallas chicas.
const stickyCell = { position: 'sticky', left: 0, background: 'var(--surface-100)', zIndex: 1, boxShadow: 'inset -1px 0 0 var(--line)' };

function CompanyTable({ rows }) {
    const [sort, setSort] = useState({ key: 'weight', dir: 'desc' });
    const sorted = useMemo(() => {
        const col = COLUMNS.find((c) => c.key === sort.key);
        const sign = sort.dir === 'asc' ? 1 : -1;
        return [...rows].sort((a, b) => {
            const va = col.value(a);
            const vb = col.value(b);
            // Sin dato siempre al final, en cualquier orden.
            if (va === null || va === undefined) return vb === null || vb === undefined ? 0 : 1;
            if (vb === null || vb === undefined) return -1;
            return (typeof va === 'string' ? va.localeCompare(vb) : va - vb) * sign;
        });
    }, [rows, sort]);

    const toggle = (col) => setSort((s) => (s.key === col.key
        ? { key: col.key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key: col.key, dir: col.dir ?? 'desc' }));

    return (
        <Card title="Empresa por empresa" aside="Tocá una columna para ordenar">
            <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '980px' }}>
                    <caption className="sr-only">Datos de cada empresa de tu cartera. Los encabezados ordenan la tabla.</caption>
                    <thead>
                        <tr>
                            {COLUMNS.map((col, i) => {
                                const active = sort.key === col.key;
                                return (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                                        style={{
                                            textAlign: col.align ?? 'right',
                                            padding: 0,
                                            borderBottom: '1px solid var(--line)',
                                            ...(i === 0 ? stickyCell : {}),
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className="label"
                                            onClick={() => toggle(col)}
                                            style={{
                                                background: 'none', border: 0, cursor: 'pointer', minHeight: '40px', width: '100%',
                                                padding: 'var(--space-2) var(--space-2)', textAlign: 'inherit', whiteSpace: 'nowrap',
                                                color: active ? 'var(--ink)' : 'var(--ink-subtle)',
                                            }}
                                        >
                                            {col.label}
                                            <span aria-hidden="true" style={{ marginLeft: '4px', opacity: active ? 1 : 0 }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>
                                        </button>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((r) => (
                            <tr key={r.symbol} style={{ borderBottom: '1px solid var(--line)' }}>
                                {COLUMNS.map((col, i) => {
                                    const Tag = i === 0 ? 'th' : 'td';
                                    return (
                                        <Tag
                                            key={col.key}
                                            scope={i === 0 ? 'row' : undefined}
                                            className={i === 0 ? undefined : 'data'}
                                            style={{
                                                textAlign: col.align ?? 'right',
                                                padding: 'var(--space-2)',
                                                fontWeight: 400,
                                                whiteSpace: 'nowrap',
                                                color: 'var(--ink)',
                                                ...(i === 0 ? stickyCell : {}),
                                            }}
                                        >
                                            <Cell col={col} r={r} />
                                        </Tag>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="body-sm" style={note}>
                Peso: sobre el total de tu cartera. Hoy: variación en BYMA. 52 semanas: dónde está el precio entre el mínimo y el máximo del último año, y cuánto le falta para el máximo. Potencial: hasta el precio objetivo promedio de los analistas.
            </p>
        </Card>
    );
}

// ─── Sección ──────────────────────────────────────────────────────────────────

function Loading() {
    return (
        <div aria-busy="true" aria-label="Cargando el análisis de tus empresas" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="skeleton" style={{ height: '120px' }} />
            <div className="skeleton" style={{ height: '260px' }} />
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                <div className="skeleton" style={{ height: '220px' }} />
                <div className="skeleton" style={{ height: '220px' }} />
            </div>
        </div>
    );
}

export default function CompanyAnalysis({ holdings, fundamentals, loading, coverage, mep }) {
    const a = useMemo(() => analyzeCompanies(holdings, fundamentals, { mep }), [holdings, fundamentals, mep]);
    const count = a.rows.length;

    return (
        <section aria-labelledby="analisis-empresas" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="section-head" style={{ marginBottom: 0, flexWrap: 'wrap' }}>
                <h2 id="analisis-empresas" className="h2" style={{ margin: 0 }}>Análisis de tus empresas</h2>
                <span className="body-sm" style={{ color: 'var(--ink-subtle)' }}>
                    {count} {count === 1 ? 'empresa' : 'empresas'} · {pct(coverage, 0)} de tu cartera
                </span>
            </div>
            <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)', maxWidth: '80ch' }}>
                Datos de Yahoo Finance sobre las acciones y CEDEARs de tu cartera, ponderados por cuánto vale cada tenencia. No incluye bonos, efectivo ni otros activos.
                {!loading && a.withoutData.length > 0 && ` Sin datos por ahora: ${a.withoutData.join(', ')}.`}
            </p>

            {loading ? <Loading /> : (
                <div className="pulso-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {a.observations.length > 0 && <Observations items={a.observations} />}
                    <Indicators metrics={a.metrics} />
                    <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                        <Analysts a={a} />
                        <Sectors a={a} />
                        <Calendar events={a.events} />
                        <Dividends a={a} />
                    </div>
                    <CompanyTable rows={a.rows} />
                </div>
            )}
        </section>
    );
}
