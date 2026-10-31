'use client';

import { useState, useEffect } from 'react';
import { MarketOverview } from "react-ts-tradingview-widgets";
import { BOND_DATA, calculateBondMetrics } from '@/utils/bondCalculator';
import Link from 'next/link';
import { TradingViewContainer } from '@/components/TradingViewContainer';
import { formatNumber } from '@/utils/formatters';

export default function RentaFijaClient() {
    const [selectedBond, setSelectedBond] = useState("AL30");
    const [price, setPrice] = useState("");
    const [metrics, setMetrics] = useState({ tir: 0, paridad: 0 });

    useEffect(() => {
        const p = parseFloat(price);
        if (!isNaN(p) && p > 0) {
            setMetrics(calculateBondMetrics(selectedBond, p));
        } else {
            setMetrics({ tir: 0, paridad: 0 });
        }
    }, [price, selectedBond]);

    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            <header
                style={{
                    borderBottom: '1px solid var(--line)',
                    padding: 'var(--space-8) 0',
                }}
            >
                <div className="pulso-container">
                    <p className="label" style={{ color: 'var(--signal-text)', margin: '0 0 var(--space-2) 0' }}>
                        TradingView · BYMA
                    </p>
                    <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                        Renta fija
                    </h1>
                    <p className="body" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                        Bonos soberanos en dólares, títulos ajustados por CER y obligaciones negociables (ONs).
                    </p>
                </div>
            </header>

            <section style={{ padding: 'var(--space-8) 0' }}>
                <div className="pulso-container grid grid-cols-1 lg:grid-cols-3" style={{ gap: 'var(--space-8)' }}>
                    <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div
                            className="overflow-hidden"
                            style={{
                                border: '1px solid var(--line)',
                                background: 'var(--surface-100)',
                                borderRadius: 'var(--radius-md)',
                                height: '600px',
                            }}
                        >
                            <TradingViewContainer height="600px">
                                {(activeTheme) => (
                                    <MarketOverview
                                        colorTheme={activeTheme}
                                        isTransparent={true}
                                        height="100%"
                                        width="100%"
                                        showFloatingTooltip
                                        dateRange="12M"
                                        locale="es"
                                        tabs={[
                                            {
                                                title: "Soberanos USD",
                                                symbols: [
                                                    { s: "BCBA:AL30",    d: "AL30 - Ley Arg 2030" },
                                                    { s: "BCBA:AL29",    d: "AL29 - Ley Arg 2029" },
                                                    { s: "BCBA:AL35",    d: "AL35 - Ley Arg 2035" },
                                                    { s: "BCBA:AE38",    d: "AE38 - Ley Arg 2038" },
                                                    { s: "BCBA:GD30",    d: "GD30 - Ley NY 2030" },
                                                    { s: "BCBA:GD35",    d: "GD35 - Ley NY 2035" },
                                                    { s: "BCBA:BOPREAL", d: "BOPREAL Serie 1" },
                                                ],
                                            },
                                            {
                                                title: "CER / Pesos",
                                                symbols: [
                                                    { s: "BCBA:TX24", d: "Bono CER TX24" },
                                                    { s: "BCBA:TX26", d: "Bono CER TX26" },
                                                    { s: "BCBA:DICP", d: "Bono Discount en Pesos" },
                                                    { s: "BCBA:PARP", d: "Bono Par en Pesos" },
                                                    { s: "BCBA:CUAP", d: "Bono Cuasi Par en Pesos" },
                                                ],
                                            },
                                            {
                                                title: "ONs",
                                                symbols: [
                                                    { s: "BCBA:YCA6O", d: "ON YPF USD 2025" },
                                                    { s: "BCBA:YMCHO", d: "ON YPF USD 2026" },
                                                    { s: "BCBA:YMCIO", d: "ON YPF USD 2029" },
                                                    { s: "BCBA:MGC3O", d: "ON Pampa Energía 2027" },
                                                    { s: "BCBA:TLC5O", d: "ON Telecom USD 2025" },
                                                    { s: "BCBA:IRC1O", d: "ON IRSA USD 2028" },
                                                    { s: "BCBA:GNCXO", d: "ON Genneia USD 2027" },
                                                ],
                                            },
                                        ]}
                                    />
                                )}
                            </TradingViewContainer>
                        </div>

                        <p className="body-sm" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                            Datos provistos vía TradingView. Información con fines informativos. No es una recomendación de inversión.
                        </p>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="pulso-card sticky top-24">
                            <h2 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-1)' }}>
                                Calculadora de TIR
                            </h2>
                            <p className="body-sm" style={{ color: 'var(--ink-muted)', marginBottom: 'var(--space-6)' }}>
                                Ingresá el precio actual cada 100 VNO para estimar rendimiento (XIRR) y paridad.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div>
                                    <label className="label" style={{ display: 'block', color: 'var(--ink-muted)', marginBottom: 'var(--space-2)' }}>
                                        Bono soberano
                                    </label>
                                    <select
                                        value={selectedBond}
                                        onChange={(e) => setSelectedBond(e.target.value)}
                                        className="pulso-input"
                                    >
                                        {Object.keys(BOND_DATA).map(ticker => (
                                            <option key={ticker} value={ticker}>
                                                {BOND_DATA[ticker].name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="label" style={{ display: 'block', color: 'var(--ink-muted)', marginBottom: 'var(--space-2)' }}>
                                        Precio (US$) por 100 VNO
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
                            </div>

                            <div className="grid grid-cols-2" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
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

                            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--line)' }}>
                                <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-3)' }}>
                                    Fichas y cronogramas de bonos
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Link href="/RentaFija/AL30" className="pulso-btn pulso-btn--secondary" style={{ height: '36px', fontSize: 'var(--text-body-sm)' }}>
                                        Ver bono AL30
                                    </Link>
                                    <Link href="/RentaFija/GD30" className="pulso-btn pulso-btn--secondary" style={{ height: '36px', fontSize: 'var(--text-body-sm)' }}>
                                        Ver bono GD30
                                    </Link>
                                    <Link href="/RentaFija/AL29" className="pulso-btn pulso-btn--secondary" style={{ height: '36px', fontSize: 'var(--text-body-sm)' }}>
                                        Ver bono AL29
                                    </Link>
                                </div>
                            </div>

                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', marginTop: 'var(--space-6)', marginBottom: 0 }}>
                                Cálculo estimado usando flujos restantes. No considera comisiones. Información con fines informativos. No es una recomendación de inversión.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
