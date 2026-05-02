import { useState, useEffect } from 'react';
import { MarketOverview } from "react-ts-tradingview-widgets";
import { useTheme } from '../hooks/useTheme';
import { BOND_DATA, calculateBondMetrics } from '../utils/bondCalculator';

export default function RentaFija() {
    const [theme] = useTheme();
    
    // Calculator state
    const [selectedBond, setSelectedBond] = useState("AL30");
    const [price, setPrice] = useState("");
    const [metrics, setMetrics] = useState({ tir: 0, paridad: 0 });

    useEffect(() => {
        document.title = 'Infopeso — Renta Fija (Bonos y ONs)';
        document.querySelector('meta[name="description"]')?.setAttribute('content',
            'Cotizaciones en tiempo real de Bonos Soberanos (AL30, GD30) y Obligaciones Negociables corporativas del mercado argentino.'
        );
    }, []);

    // Recalculate metrics when price or bond changes
    useEffect(() => {
        const p = parseFloat(price);
        if (!isNaN(p) && p > 0) {
            setMetrics(calculateBondMetrics(selectedBond, p));
        } else {
            setMetrics({ tir: 0, paridad: 0 });
        }
    }, [price, selectedBond]);

    return (
        <main className="min-h-screen pt-16">

            {/* ── Page header ─────────────────────────────────── */}
            <div
                className="px-5 sm:px-8 py-8"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
                <div className="max-w-[1200px] mx-auto">
                    <p
                        className="text-xs font-semibold uppercase tracking-[0.12em] mb-1"
                        style={{ color: 'var(--accent)', fontFamily: 'General Sans, system-ui' }}
                    >
                        TradingView · BCBA
                    </p>
                    <h1
                        className="text-3xl sm:text-4xl font-bold tracking-tight"
                        style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}
                    >
                        Renta Fija
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Bonos soberanos y obligaciones negociables (ONs)
                    </p>
                </div>
            </div>

            <section className="px-5 sm:px-8 py-8">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Left Column: Market overview ────────────── */}
                    <div className="lg:col-span-2 space-y-4">
                        <div
                            className="rounded-[12px] overflow-hidden"
                            style={{
                                border: '1px solid var(--border-subtle)',
                                height: '600px',
                            }}
                        >
                            <MarketOverview
                                colorTheme={theme}
                                height="100%"
                                width="100%"
                                showFloatingTooltip
                                dateRange="12M"
                                locale="es"
                                tabs={[
                                    {
                                        title: "Soberanos USD",
                                        symbols: [
                                            { s: "BCBA:AL30",   d: "AL30 - Ley Arg 2030" },
                                            { s: "BCBA:AL29",   d: "AL29 - Ley Arg 2029" },
                                            { s: "BCBA:AL35",   d: "AL35 - Ley Arg 2035" },
                                            { s: "BCBA:AE38",   d: "AE38 - Ley Arg 2038" },
                                            { s: "BCBA:GD30",   d: "GD30 - Ley NY 2030" },
                                            { s: "BCBA:GD35",   d: "GD35 - Ley NY 2035" },
                                            { s: "BCBA:BOPREAL",d: "BOPREAL Serie 1" },
                                        ],
                                    },
                                    {
                                        title: "CER / Pesos",
                                        symbols: [
                                            { s: "BCBA:TX24",  d: "Bono CER TX24" },
                                            { s: "BCBA:TX26",  d: "Bono CER TX26" },
                                            { s: "BCBA:DICP",  d: "Bono Discount en Pesos" },
                                            { s: "BCBA:PARP",  d: "Bono Par en Pesos" },
                                            { s: "BCBA:CUAP",  d: "Bono Cuasi Par en Pesos" },
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
                        </div>
                        
                        {/* Disclaimer */}
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            Datos provistos vía TradingView.
                        </p>
                    </div>

                    {/* ── Right Column: TIR Calculator ────────────── */}
                    <div className="lg:col-span-1">
                        <div
                            className="rounded-[16px] p-6 sticky top-24"
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)'
                            }}
                        >
                            <h2 
                                className="text-xl font-bold mb-1"
                                style={{ fontFamily: 'Satoshi, system-ui', color: 'var(--text-primary)' }}
                            >
                                Calculadora de TIR
                            </h2>
                            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                                Ingresa el precio actual para ver el rendimiento estimado (XIRR).
                            </p>

                            <div className="space-y-4">
                                {/* Select Bond */}
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                        Bono Soberano
                                    </label>
                                    <select
                                        value={selectedBond}
                                        onChange={(e) => setSelectedBond(e.target.value)}
                                        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                                        style={{
                                            background: 'var(--bg-page)',
                                            border: '1px solid var(--border-subtle)',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        {Object.keys(BOND_DATA).map(ticker => (
                                            <option key={ticker} value={ticker}>
                                                {BOND_DATA[ticker].name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Input Price */}
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                        Precio (USD) per 100 VNO
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-secondary)' }}>$</span>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="Ej. 55.40"
                                            className="w-full rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none transition-colors"
                                            style={{
                                                background: 'var(--bg-page)',
                                                border: '1px solid var(--border-subtle)',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="mt-8 grid grid-cols-2 gap-3">
                                <div 
                                    className="rounded-xl p-4"
                                    style={{ background: 'var(--bg-page)' }}
                                >
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>TIR (Rendimiento)</p>
                                    <p 
                                        className="text-2xl font-bold"
                                        style={{ fontFamily: 'Satoshi, system-ui', color: metrics.tir > 0 ? 'var(--semantic-positive)' : 'var(--text-primary)' }}
                                    >
                                        {price ? `${metrics.tir}%` : '--'}
                                    </p>
                                </div>
                                <div 
                                    className="rounded-xl p-4"
                                    style={{ background: 'var(--bg-page)' }}
                                >
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Paridad</p>
                                    <p 
                                        className="text-2xl font-bold"
                                        style={{ fontFamily: 'Satoshi, system-ui', color: 'var(--text-primary)' }}
                                    >
                                        {price ? `${metrics.paridad}%` : '--'}
                                    </p>
                                </div>
                            </div>

                            <p className="text-[10px] text-center mt-6" style={{ color: 'var(--text-tertiary)' }}>
                                * Cálculo aproximado usando flujos restantes (2026+). No considera comisiones. Solo para fines educativos.
                            </p>
                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
}
