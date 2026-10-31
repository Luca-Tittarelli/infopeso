'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/pulso/Button';
import { formatNumber } from '@/utils/formatters';
import { KIND_LABELS } from '@/lib/portfolio/valuation';
import { track } from '@/lib/track';
import {
    BROKERS,
    ROLES,
    parseCsvText,
    buildPositions,
    classifyPositions,
    candidateSymbols,
} from '@/lib/portfolio/importCsv';

const MAX_FILE_BYTES = 2 * 1024 * 1024;

const STATUS = {
    ok: { label: 'Listo', color: 'var(--ink-muted)' },
    'sin-precio': { label: 'Sin precio en vivo: usa el monto del archivo', color: 'var(--signal-text)' },
    'no-reconocido': { label: 'No reconocido: se omite', color: 'var(--down)' },
};

const selectStyle = { width: '100%', fontFamily: 'var(--font-display)', fontSize: '14px' };

function Labeled({ label, children }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span className="label" style={{ color: 'var(--ink-muted)' }}>{label}</span>
            {children}
        </label>
    );
}

// Importación de un archivo CSV de un broker. Los archivos se leen en el navegador: no se suben a ningún servidor.
export default function ImportPanel({ existing, onImport, onClose }) {
    const [broker, setBroker] = useState('Cocos');
    const [brokerTouched, setBrokerTouched] = useState(false);
    const [fileName, setFileName] = useState('');
    const [pasted, setPasted] = useState('');
    const [parsed, setParsed] = useState(null);
    const [mapping, setMapping] = useState({});
    const [error, setError] = useState('');
    const [quotes, setQuotes] = useState(null);
    const [quotesFailed, setQuotesFailed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showMapping, setShowMapping] = useState(false);
    const requestRef = useRef(0);

    useEffect(() => { track('import_open'); }, []);

    const built =useMemo(() => (parsed ? buildPositions(parsed, mapping, broker) : null), [parsed, mapping, broker]);
    const symbolsKey = built ? candidateSymbols(built.positions).join(',') : '';

    // Consulta las cotizaciones de los tickers del archivo para definir el tipo y la moneda de cada uno.
    useEffect(() => {
        if (!symbolsKey) return;
        const id = ++requestRef.current;
        fetch(`/api/prices?symbols=${encodeURIComponent(symbolsKey)}`)
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error('precios'))))
            .then((data) => {
                if (requestRef.current !== id) return;
                setQuotes(data.quotes ?? {});
                setQuotesFailed(!data.sourceOk);
            })
            .catch(() => {
                if (requestRef.current !== id) return;
                setQuotes({});
                setQuotesFailed(true);
            });
    }, [symbolsKey]);

    const preview = useMemo(() => {
        if (!built) return [];
        return classifyPositions(built.positions, built.positions.some((p) => p.kind !== 'cash') ? quotes ?? {} : {});
    }, [built, quotes]);

    const waitingQuotes = Boolean(symbolsKey) && quotes === null;
    const importable = preview.filter((p) => p.status !== 'no-reconocido');
    const replacing = existing.filter((p) => p.broker === broker).length;
    const mappingMissing = ROLES.filter((r) => r.required && (mapping[r.id] === undefined || mapping[r.id] === ''));

    async function onFile(e) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setError('');
        setParsed(null);
        setQuotes(null);
        setQuotesFailed(false);
        setShowMapping(false);

        if (file.size > MAX_FILE_BYTES) {
            track('import_error', { reason: 'size' });
            setError('El archivo es muy grande (máximo 2 MB). Revisá que sea la tenencia y no un historial completo.');
            return;
        }
        if (/\.xlsx?$/i.test(file.name)) {
            track('import_error', { reason: 'excel' });
            setError('Por ahora se aceptan archivos CSV. En Excel: Archivo → Guardar como → CSV, y subí ese archivo.');
            return;
        }
        loadText(await file.text(), file.name);
    }

    // Sirve tanto para un archivo como para una tabla copiada y pegada desde la web del broker.
    function loadText(text, name) {
        const result = parseCsvText(text);
        if (result.error) {
            track('import_error', { reason: 'parse' });
            setError(result.error);
            return;
        }
        track('import_preview', { broker: result.detectedBroker ?? broker, rows: result.rows.length });
        setError('');
        setQuotes(null);
        setQuotesFailed(false);
        setFileName(name);
        setParsed(result);
        setMapping(result.mapping);
        if (!brokerTouched && result.detectedBroker) setBroker(result.detectedBroker);
        setShowMapping(ROLES.some((r) => r.required && result.mapping[r.id] === undefined));
    }

    async function confirm() {
        setSaving(true);
        const ok = await onImport(broker, importable.map(({ status, label, ...rest }) => rest));
        setSaving(false);
        if (ok) {
            track('import_success', { broker, count: importable.length });
            onClose();
        } else {
            track('import_error', { reason: 'save' });
            setError('No pudimos guardar la cartera en tu cuenta. Probá de nuevo.');
        }
    }

    return (
        <section className="pulso-card-lg" aria-label="Importar tenencia desde un broker" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="h2" style={{ margin: 0 }}>Importar desde tu broker</h2>
                    <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 'var(--space-1) 0 0 0' }}>
                        Elegí el broker y subí el CSV de tu tenencia. Podés repetirlo con cada broker: las cantidades se suman y los porcentajes se calculan sobre el total.
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                <Labeled label="Broker">
                    <select
                        className="pulso-input"
                        style={selectStyle}
                        value={broker}
                        onChange={(e) => { setBroker(e.target.value); setBrokerTouched(true); }}
                    >
                        {BROKERS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
                    </select>
                </Labeled>
                <Labeled label="Archivo CSV">
                    <input type="file" accept=".csv,text/csv,text/plain" onChange={onFile} className="pulso-input" style={{ paddingTop: 'var(--space-2)' }} />
                </Labeled>
            </div>

            <details>
                <summary className="body-sm" style={{ cursor: 'pointer', color: 'var(--ink-muted)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                    ¿Tu broker no deja descargar un archivo? Copiá la tabla y pegala acá
                </summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <textarea
                        className="pulso-input"
                        rows={5}
                        aria-label="Tabla de tenencia copiada desde el broker"
                        placeholder={'Seleccioná la tabla de tu tenencia en la web del broker, copiala (Ctrl+C) y pegala acá. La primera fila tiene que ser la de los títulos (Ticker, Cantidad, etc.).'}
                        value={pasted}
                        onChange={(e) => setPasted(e.target.value)}
                        style={{ fontFamily: 'var(--font-mono)' }}
                    />
                    <div><Button size="sm" variant="secondary" disabled={!pasted.trim()} onClick={() => loadText(pasted, 'texto pegado')}>Usar este texto</Button></div>
                </div>
            </details>

            {error && (
                <p role="alert" className="body-sm" style={{ margin: 0, padding: 'var(--space-3) var(--space-4)', background: 'var(--surface-200)', borderLeft: '2px solid var(--signal)', borderRadius: 'var(--radius-sm)', color: 'var(--ink)' }}>
                    {error}
                </p>
            )}

            {parsed && (
                <>
                    <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                        <span className="data" style={{ color: 'var(--ink)' }}>{fileName}</span>: {parsed.rows.length} filas.{' '}
                        <button type="button" onClick={() => setShowMapping((v) => !v)} style={{ color: 'var(--signal-text)', textDecoration: 'underline', textUnderlineOffset: '3px', background: 'none', border: 0, cursor: 'pointer', padding: 0, font: 'inherit' }}>
                            {showMapping ? 'Ocultar columnas' : 'Ver o corregir las columnas'}
                        </button>
                    </p>

                    {showMapping && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-3)' }}>
                            {ROLES.map((role) => (
                                <Labeled key={role.id} label={role.label}>
                                    <select
                                        className="pulso-input"
                                        style={selectStyle}
                                        value={mapping[role.id] ?? ''}
                                        onChange={(e) => setMapping((m) => ({ ...m, [role.id]: e.target.value === '' ? undefined : Number(e.target.value) }))}
                                    >
                                        <option value="">{role.required ? 'Elegí una columna' : 'No usar'}</option>
                                        {parsed.headers.map((h, i) => <option key={i} value={i}>{h || `Columna ${i + 1}`}</option>)}
                                    </select>
                                </Labeled>
                            ))}
                        </div>
                    )}

                    {mappingMissing.length > 0 ? (
                        <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                            No pudimos identificar {mappingMissing.map((r) => r.label.toLowerCase()).join(' ni ')}. Elegí la columna correcta arriba.
                        </p>
                    ) : (
                        <>
                            {quotesFailed && (
                                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                                    No pudimos consultar los precios de BYMA ahora. Podés importar igual: los activos se valúan con los montos del archivo y se actualizan después.
                                </p>
                            )}
                            <div className="overflow-x-auto" style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
                                <table className="w-full text-left" style={{ borderCollapse: 'collapse', minWidth: '560px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-subtle)' }}>
                                            <th scope="col" className="label" style={{ padding: 'var(--space-2) var(--space-3)' }}>Ticker</th>
                                            <th scope="col" className="label" style={{ padding: 'var(--space-2) var(--space-3)' }}>Tipo</th>
                                            <th scope="col" className="label text-right" style={{ padding: 'var(--space-2) var(--space-3)' }}>Cantidad</th>
                                            <th scope="col" className="label" style={{ padding: 'var(--space-2) var(--space-3)' }}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.slice(0, 100).map((p) => (
                                            <tr key={`${p.symbol}-${p.kind}`} style={{ borderBottom: '1px solid var(--line)' }}>
                                                <td className="data" style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>{p.symbol}{p.currency === 'USD' && p.kind !== 'cash' ? ' (US$)' : ''}</td>
                                                <td className="body-sm" style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink-muted)' }}>{p.kind === 'pending' ? '…' : KIND_LABELS[p.kind]}</td>
                                                <td className="data text-right" style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>{formatNumber(p.quantity, { minimumFractionDigits: 0, maximumFractionDigits: 4 })}</td>
                                                <td className="body-sm" style={{ padding: 'var(--space-2) var(--space-3)', color: (STATUS[p.status] ?? STATUS.ok).color }}>{waitingQuotes && p.kind !== 'cash' ? 'Consultando precios…' : (STATUS[p.status] ?? STATUS.ok).label}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {preview.length > 100 && <p className="body-sm" style={{ margin: 0, color: 'var(--ink-subtle)' }}>Se muestran las primeras 100 de {preview.length} posiciones.</p>}

                            {built.skipped.length > 0 && (
                                <details>
                                    <summary className="body-sm" style={{ cursor: 'pointer', color: 'var(--ink-muted)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                                        {built.skipped.length} {built.skipped.length === 1 ? 'fila omitida' : 'filas omitidas'}
                                    </summary>
                                    <ul className="body-sm" style={{ margin: 0, paddingLeft: 'var(--space-6)', color: 'var(--ink-muted)' }}>
                                        {built.skipped.slice(0, 30).map((s, i) => <li key={i}>Fila {s.line}: “{s.raw}”. {s.reason}</li>)}
                                    </ul>
                                </details>
                            )}

                            <div className="flex flex-wrap items-center gap-3">
                                <Button onClick={confirm} loading={saving} loadingText="Guardando…" disabled={importable.length === 0 || waitingQuotes}>
                                    {replacing > 0 ? `Reemplazar las posiciones de ${broker}` : `Importar ${importable.length} ${importable.length === 1 ? 'posición' : 'posiciones'}`}
                                </Button>
                                {replacing > 0 && (
                                    <span className="body-sm" style={{ color: 'var(--ink-muted)' }}>
                                        Se reemplazan las {replacing} posiciones actuales de {broker}. Las de otros brokers no cambian.
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </section>
    );
}
