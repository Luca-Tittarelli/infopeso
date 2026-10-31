'use client';

import { useState } from 'react';
import { formatNumber } from '@/utils/formatters';

const PRESET_AMOUNTS = [10, 50, 100, 200, 500, 1000];

export default function CalculadoraBlueClient({ initialDolar }) {
    const compra = initialDolar?.compra || 0;
    const venta = initialDolar?.venta || 0;

    const [amountUSD, setAmountUSD] = useState('100');
    const [amountARS, setAmountARS] = useState(venta ? (100 * venta).toString() : '');

    const handleUSDChange = (val) => {
        setAmountUSD(val);
        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0 && venta > 0) {
            setAmountARS((num * venta).toFixed(0));
        } else {
            setAmountARS('');
        }
    };

    const handleARSChange = (val) => {
        setAmountARS(val);
        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0 && compra > 0) {
            setAmountUSD((num / compra).toFixed(2));
        } else {
            setAmountUSD('');
        }
    };

    const selectPreset = (usd) => {
        setAmountUSD(usd.toString());
        if (venta > 0) {
            setAmountARS((usd * venta).toFixed(0));
        }
    };

    return (
        <section className="space-y-8 animate-fade-in">
            {/* Header: Cotización Actual */}
            <div className="pulso-card flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <span className="label" style={{ color: 'var(--signal-text)', display: 'inline-block', marginBottom: 'var(--space-1)' }}>
                        HERRAMIENTA DE CONVERSIÓN ONLINE
                    </span>
                    <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                        Calculadora de pesos a dólar blue hoy
                    </h1>
                </div>
                <div className="flex flex-wrap gap-8">
                    <div>
                        <p className="label" style={{ color: 'var(--ink-subtle)', margin: '0 0 var(--space-1) 0' }}>
                            Compra (te pagan)
                        </p>
                        <p className="figure" style={{ color: 'var(--ink)', margin: 0 }}>
                            {compra ? (
                                <>
                                    <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginRight: '0.2em' }}>$</span>
                                    {formatNumber(compra, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </>
                            ) : '—'}
                        </p>
                    </div>
                    <div>
                        <p className="label" style={{ color: 'var(--ink-subtle)', margin: '0 0 var(--space-1) 0' }}>
                            Venta (vos comprás)
                        </p>
                        <p className="figure" style={{ color: 'var(--signal-text)', margin: 0 }}>
                            {venta ? (
                                <>
                                    <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginRight: '0.2em' }}>$</span>
                                    {formatNumber(venta, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </>
                            ) : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Calculadora Interactiva Principal */}
            <div className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                    Convertidor bidireccional
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 items-center" style={{ gap: 'var(--space-6)' }}>
                    <div>
                        <label className="label" style={{ display: 'block', color: 'var(--ink-muted)', marginBottom: 'var(--space-2)' }}>
                            Dólares estadounidenses (US$)
                        </label>
                        <div className="relative">
                            <span
                                className="data"
                                style={{
                                    position: 'absolute',
                                    left: 'var(--space-3)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--ink-subtle)',
                                    fontWeight: 500,
                                }}
                            >
                                US$
                            </span>
                            <input
                                type="number"
                                value={amountUSD}
                                onChange={(e) => handleUSDChange(e.target.value)}
                                placeholder="100"
                                className="pulso-input data"
                                style={{ paddingLeft: 'var(--space-12)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label" style={{ display: 'block', color: 'var(--ink-muted)', marginBottom: 'var(--space-2)' }}>
                            Pesos argentinos (ARS)
                        </label>
                        <div className="relative">
                            <span
                                className="data"
                                style={{
                                    position: 'absolute',
                                    left: 'var(--space-3)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--ink-subtle)',
                                    fontWeight: 500,
                                }}
                            >
                                $
                            </span>
                            <input
                                type="number"
                                value={amountARS}
                                onChange={(e) => handleARSChange(e.target.value)}
                                placeholder="128000"
                                className="pulso-input data"
                                style={{ paddingLeft: 'var(--space-8)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Accesos Rápidos por Monto */}
                <div>
                    <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-2)' }}>
                        Montos frecuentes
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_AMOUNTS.map((usd) => {
                            const active = amountUSD === usd.toString();
                            return (
                                <button
                                    key={usd}
                                    type="button"
                                    onClick={() => selectPreset(usd)}
                                    className={active ? 'pill-active data' : 'pill-inactive data'}
                                    style={{
                                        padding: '0 var(--space-3)',
                                        minHeight: '36px',
                                        borderRadius: 'var(--radius-pill)',
                                        fontSize: 'var(--text-body-sm)',
                                        cursor: 'pointer',
                                        transition: 'background-color 150ms ease, color 150ms ease',
                                    }}
                                >
                                    US$ {usd}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tabla pSEO de Montos Rápidos */}
            <div className="pulso-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--line)' }}>
                    <h3 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                        Tabla de equivalencias rápidas (dólar blue a pesos)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '480px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--line)' }}>
                                <th scope="col" className="label text-left" style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--ink-subtle)' }}>
                                    Monto dólares (US$)
                                </th>
                                <th scope="col" className="label text-right" style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--ink-subtle)' }}>
                                    Precio de venta (ARS)
                                </th>
                                <th scope="col" className="label text-right" style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--ink-subtle)' }}>
                                    Precio de compra (ARS)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[10, 50, 100, 200, 500, 1000, 5000].map((usd) => (
                                <tr key={usd} style={{ borderBottom: '1px solid var(--line)' }}>
                                    <td className="data" style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--ink)', fontWeight: 500 }}>
                                        US$ {formatNumber(usd, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="data text-right" style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--ink)', fontWeight: 500 }}>
                                        {venta ? `$ ${formatNumber(usd * venta, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'}
                                    </td>
                                    <td className="data text-right" style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--ink-muted)' }}>
                                        {compra ? `$ ${formatNumber(usd * compra, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
