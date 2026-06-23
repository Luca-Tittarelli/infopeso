'use client';

import { useState, useEffect } from 'react';
import LineChart from '@/charts/ChartLine';
import { useTheme } from '@/hooks/useTheme';
import { filtrarUltimoMes } from '@/utils/functions';

export default function CambiosDetalleClient({ id, meta, initialData, initialHistory }) {
    const [theme] = useTheme();
    const [compra, setCompra] = useState(initialData?.compra || 0);
    const [venta, setVenta] = useState(initialData?.venta || 0);
    const [amountPesos, setAmountPesos] = useState('');
    const [amountCurrency, setAmountCurrency] = useState('');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(typeof window !== 'undefined' && document.documentElement.classList.contains('dark'));
    }, [theme]);

    // Handle interactive conversions
    const handlePesosChange = (val) => {
        setAmountPesos(val);
        const num = parseFloat(val);
        if (!isNaN(num) && num > 0 && venta > 0) {
            setAmountCurrency((num / venta).toFixed(2));
        } else {
            setAmountCurrency('');
        }
    };

    const handleCurrencyChange = (val) => {
        setAmountCurrency(val);
        const num = parseFloat(val);
        if (!isNaN(num) && num > 0 && compra > 0) {
            setAmountPesos((num * compra).toFixed(2));
        } else {
            setAmountPesos('');
        }
    };

    // Filter historical data for chart
    const historyData = initialHistory ? filtrarUltimoMes(initialHistory).reverse() : [];
    const labels = historyData.map(item => item.fecha);
    const values = historyData.map(item => item.venta || item.valor);

    const chartColor = historyData.length > 0
        ? historyData[0].venta < venta
            ? (isDark ? '#2ECC71' : '#1A8A4A')
            : historyData[0].venta > venta
                ? (isDark ? '#E74C3C' : '#C0392B')
                : '#9C9890'
        : '#C47B2B';

    return (
        <section className="space-y-8 animate-fade-in">
            {/* Header: Cotización Actual */}
            <div className="p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}>
                        Cotización en tiempo real
                    </h2>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                        {meta.name} Hoy
                    </h1>
                </div>
                <div className="flex gap-8">
                    <div className="text-center">
                        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Compra</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            ${compra ? Number(compra).toLocaleString('es-AR', { minimumFractionDigits: 1 }) : '—'}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Venta</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            ${venta ? Number(venta).toLocaleString('es-AR', { minimumFractionDigits: 1 }) : '—'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calculadora */}
                <div className="lg:col-span-1 p-6 rounded-xl space-y-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                        <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                            Conversor de Moneda
                        </h2>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Calculadora en pesos argentinos al tipo de cambio de {meta.name}.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                Pesos Argentinos (ARS)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-secondary)' }}>$</span>
                                <input
                                    type="number"
                                    value={amountPesos}
                                    onChange={(e) => handlePesosChange(e.target.value)}
                                    placeholder="Ej. 10000"
                                    className="w-full rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none transition-colors"
                                    style={{
                                        background: 'var(--bg-page)',
                                        border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            ⇄
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                {meta.name} (USD/Divisa)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-secondary)' }}>U$S</span>
                                <input
                                    type="number"
                                    value={amountCurrency}
                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                    placeholder="Ej. 10"
                                    className="w-full rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none transition-colors"
                                    style={{
                                        background: 'var(--bg-page)',
                                        border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-center" style={{ color: 'var(--text-tertiary)' }}>
                        * Conversión usando precio de venta para comprar divisas y precio de compra para liquidarlas.
                    </p>
                </div>

                {/* Gráfico Histórico */}
                <div className="lg:col-span-2 p-6 rounded-xl flex flex-col justify-between" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                        <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                            Evolución del último mes
                        </h2>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Histórico de cotización diaria del {meta.name}.
                        </p>
                    </div>

                    <div style={{ height: '240px', width: '100%', marginTop: '20px' }}>
                        {historyData.length > 0 ? (
                            <LineChart labels={labels} dataset={values} height={240} color={chartColor} duration="month" showAxes={true} />
                        ) : (
                            <div className="skeleton w-full h-full rounded" />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
