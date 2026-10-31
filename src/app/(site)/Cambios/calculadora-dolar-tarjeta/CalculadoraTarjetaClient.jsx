'use client';

import { useState } from 'react';
import { formatNumber } from '@/utils/formatters';

const STREAMING_SERVICES = [
    { name: 'Netflix Estándar', usd: 9.99 },
    { name: 'Spotify Individual', usd: 4.99 },
    { name: 'YouTube Premium', usd: 3.99 },
    { name: 'Steam Juego (US$ 10)', usd: 10.00 },
    { name: 'Amazon Prime', usd: 5.99 },
    { name: 'iCloud 200GB', usd: 2.99 }
];

export default function CalculadoraTarjetaClient({ initialDolar, initialTarjeta }) {
    const oficialVenta = initialDolar?.venta || 0;

    const taxRatePct = oficialVenta && initialTarjeta?.venta
        ? Math.round((initialTarjeta.venta / oficialVenta - 1) * 1000) / 10
        : 30;
    const dolarTarjetaVal = oficialVenta ? oficialVenta * (1 + taxRatePct / 100) : 0;

    const [amountUSD, setAmountUSD] = useState('10');
    const [amountARS, setAmountARS] = useState(dolarTarjetaVal ? (10 * dolarTarjetaVal).toFixed(0) : '');

    const handleUSDChange = (val) => {
        setAmountUSD(val);
        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0 && dolarTarjetaVal > 0) {
            setAmountARS((num * dolarTarjetaVal).toFixed(0));
        } else {
            setAmountARS('');
        }
    };

    const selectService = (usd) => {
        setAmountUSD(usd.toString());
        if (dolarTarjetaVal > 0) {
            setAmountARS((usd * dolarTarjetaVal).toFixed(0));
        }
    };

    const baseUSD = parseFloat(amountUSD) || 0;
    const baseARS = baseUSD * oficialVenta;
    const taxARS = baseARS * (taxRatePct / 100);
    const totalARS = baseARS + taxARS;

    return (
        <section className="space-y-8 animate-fade-in">
            {/* Header: Cotización Actual */}
            <div className="pulso-card flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <span className="label" style={{ color: 'var(--signal-text)', display: 'inline-block', marginBottom: 'var(--space-1)' }}>
                        CALCULADORA IMPOSITIVA DE SERVICIOS DIGITALES
                    </span>
                    <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                        Calculadora dólar tarjeta e impuestos hoy
                    </h1>
                </div>
                <div className="flex flex-wrap gap-8">
                    <div>
                        <p className="label" style={{ color: 'var(--ink-subtle)', margin: '0 0 var(--space-1) 0' }}>
                            Oficial BNA
                        </p>
                        <p className="figure" style={{ color: 'var(--ink)', margin: 0 }}>
                            {oficialVenta ? (
                                <>
                                    <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginRight: '0.2em' }}>$</span>
                                    {formatNumber(oficialVenta, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </>
                            ) : '—'}
                        </p>
                    </div>
                    <div>
                        <p className="label" style={{ color: 'var(--ink-subtle)', margin: '0 0 var(--space-1) 0' }}>
                            Dólar tarjeta total
                        </p>
                        <p className="figure" style={{ color: 'var(--signal-text)', margin: 0 }}>
                            {dolarTarjetaVal ? (
                                <>
                                    <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginRight: '0.2em' }}>$</span>
                                    {formatNumber(dolarTarjetaVal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </>
                            ) : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Calculadora Interactiva Principal */}
            <div className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                    Calculador de consumos con tarjeta en el exterior
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
                    <div>
                        <label className="label" style={{ display: 'block', color: 'var(--ink-muted)', marginBottom: 'var(--space-2)' }}>
                            Monto en dólares (US$)
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
                                placeholder="10"
                                className="pulso-input data"
                                style={{ paddingLeft: 'var(--space-12)' }}
                            />
                        </div>
                    </div>

                    {/* Desglose de Impuestos */}
                    <div
                        style={{
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--ground-000)',
                            border: '1px solid var(--line)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-2)',
                        }}
                    >
                        <div className="flex justify-between items-center body-sm">
                            <span style={{ color: 'var(--ink-muted)' }}>Subtotal oficial:</span>
                            <span className="data" style={{ color: 'var(--ink)' }}>
                                $ {formatNumber(baseARS, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center body-sm">
                            <span style={{ color: 'var(--ink-muted)' }}>
                                Percepción impositiva (+{formatNumber(taxRatePct, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} %):
                            </span>
                            <span className="data" style={{ color: 'var(--signal-text)' }}>
                                +$ {formatNumber(taxARS, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        </div>
                        <div
                            className="flex justify-between items-center pt-2"
                            style={{ borderTop: '1px solid var(--line)' }}
                        >
                            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--ink)' }}>
                                Total final en resumen:
                            </span>
                            <span className="data" style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 'var(--text-body)' }}>
                                $ {formatNumber(totalARS, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ARS
                            </span>
                        </div>
                    </div>
                </div>

                {/* Accesos Rápidos por Servicios de Streaming */}
                <div>
                    <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-2)' }}>
                        Servicios y suscripciones frecuentes
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 'var(--space-2)' }}>
                        {STREAMING_SERVICES.map((srv) => {
                            const active = amountUSD === srv.usd.toString();
                            return (
                                <button
                                    key={srv.name}
                                    type="button"
                                    onClick={() => selectService(srv.usd)}
                                    style={{
                                        padding: 'var(--space-3)',
                                        borderRadius: 'var(--radius-sm)',
                                        textAlign: 'left',
                                        background: active ? 'var(--surface-200)' : 'var(--ground-000)',
                                        border: active ? '1px solid var(--ink)' : '1px solid var(--line)',
                                        color: 'var(--ink)',
                                        cursor: 'pointer',
                                        minHeight: '44px',
                                        transition: 'background-color 150ms ease, border-color 150ms ease',
                                    }}
                                >
                                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body-sm)', fontWeight: 600, margin: 0 }}>
                                        {srv.name}
                                    </p>
                                    <p className="data" style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                                        US$ {formatNumber(srv.usd, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
