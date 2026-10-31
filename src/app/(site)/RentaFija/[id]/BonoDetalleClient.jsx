'use client';

import { useState, useEffect } from 'react';
import { calculateBondMetrics } from '@/utils/bondCalculator';
import { MiniChart } from 'react-ts-tradingview-widgets';
import { TradingViewContainer } from '@/components/TradingViewContainer';
import { formatNumber } from '@/utils/formatters';

export default function BonoDetalleClient({ ticker, bond, initialPrice = null }) {
    const [price, setPrice] = useState(initialPrice ? String(initialPrice) : '');
    const [metrics, setMetrics] = useState(() => (initialPrice ? calculateBondMetrics(ticker, initialPrice) : { tir: 0, paridad: 0 }));

    useEffect(() => {
        const p = parseFloat(price);
        if (!isNaN(p) && p > 0) {
            setMetrics(calculateBondMetrics(ticker, p));
        } else {
            setMetrics({ tir: 0, paridad: 0 });
        }
    }, [price, ticker]);

    return (
        <section className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
                {/* Calculadora */}
                <div className="lg:col-span-1 pulso-card flex flex-col justify-between" style={{ gap: 'var(--space-6)' }}>
                    <div>
                        <h1 className="h2" style={{ color: 'var(--ink)', margin: '0 0 var(--space-1) 0' }}>
                            Calculadora {ticker}
                        </h1>
                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            Precio de mercado en dólares MEP (editable) para estimar el rendimiento.
                        </p>
                    </div>

                    <div>
                        <label className="label" style={{ display: 'block', color: 'var(--ink-muted)', marginBottom: 'var(--space-2)' }}>
                            Precio actual (US$ por 100 VNO)
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
                                }}
                            >
                                US$
                            </span>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="55.40"
                                className="pulso-input data"
                                style={{ paddingLeft: 'var(--space-12)' }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: 'var(--space-3)' }}>
                        <div
                            style={{
                                background: 'var(--ground-000)',
                                border: '1px solid var(--line)',
                                borderRadius: 'var(--radius-sm)',
                                padding: 'var(--space-4)',
                            }}
                        >
                            <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>
                                TIR (Rendimiento)
                            </p>
                            <p
                                className="figure"
                                style={{
                                    fontSize: 'var(--text-h1)',
                                    color: metrics.tir > 0 ? 'var(--signal-text)' : 'var(--ink)',
                                    margin: 0,
                                }}
                            >
                                {price ? `${formatNumber(metrics.tir, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %` : '—'}
                            </p>
                        </div>
                        <div
                            style={{
                                background: 'var(--ground-000)',
                                border: '1px solid var(--line)',
                                borderRadius: 'var(--radius-sm)',
                                padding: 'var(--space-4)',
                            }}
                        >
                            <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>
                                Paridad
                            </p>
                            <p
                                className="figure"
                                style={{
                                    fontSize: 'var(--text-h1)',
                                    color: 'var(--ink)',
                                    margin: 0,
                                }}
                            >
                                {price ? `${formatNumber(metrics.paridad, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %` : '—'}
                            </p>
                        </div>
                    </div>

                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                        Cálculo estimado con los pagos pendientes del cronograma oficial (Res. 381/2020).
                    </p>
                </div>

                {/* Gráfico y Cronograma */}
                <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {/* TradingView MiniChart */}
                    <div
                        className="overflow-hidden"
                        style={{
                            border: '1px solid var(--line)',
                            background: 'var(--surface-100)',
                            borderRadius: 'var(--radius-md)',
                            height: '180px',
                        }}
                    >
                        <div
                            className="flex items-center justify-between"
                            style={{
                                padding: 'var(--space-3) var(--space-4)',
                                borderBottom: '1px solid var(--line)',
                            }}
                        >
                            <h2 className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                                Gráfico en tiempo real
                            </h2>
                            <span className="source-badge">TradingView</span>
                        </div>
                        <div style={{ height: '135px' }}>
                            <TradingViewContainer height="135px">
                                {(activeTheme) => (
                                    <MiniChart
                                        key={`bono-${ticker}-${activeTheme}`}
                                        colorTheme={activeTheme}
                                        width="100%"
                                        height="100%"
                                        symbol={`BCBA:${ticker}`}
                                        locale="es"
                                        isTransparent={true}
                                    />
                                )}
                            </TradingViewContainer>
                        </div>
                    </div>

                    {/* Flujo de Fondos */}
                    <div className="pulso-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--line)' }}>
                            <h2 className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                                Calendario de pagos pendientes (por 100 VNO)
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                                        <th scope="col" className="label text-left" style={{ padding: 'var(--space-3) var(--space-5)', color: 'var(--ink-subtle)' }}>
                                            Fecha de pago
                                        </th>
                                        <th scope="col" className="label text-right" style={{ padding: 'var(--space-3) var(--space-5)', color: 'var(--ink-subtle)' }}>
                                            Monto (US$)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bond.flows.map((flow, index) => {
                                        const isPast = new Date(flow.date) < new Date();
                                        return (
                                            <tr
                                                key={index}
                                                style={{
                                                    borderBottom: '1px solid var(--line)',
                                                    opacity: isPast ? 0.45 : 1,
                                                }}
                                            >
                                                <td className="body-sm" style={{ padding: 'var(--space-3) var(--space-5)', color: 'var(--ink)' }}>
                                                    {new Date(flow.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    {isPast && (
                                                        <span className="label ml-2" style={{ color: 'var(--ink-subtle)' }}>
                                                            (Pagado)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="data text-right" style={{ padding: 'var(--space-3) var(--space-5)', color: 'var(--ink)', fontWeight: 500 }}>
                                                    US$ {formatNumber(flow.amount, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
