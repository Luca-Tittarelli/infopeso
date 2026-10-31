'use client';

import { useState } from 'react';
import LineChart from '@/charts/ChartLine';
import { filtrarUltimoMes } from '@/utils/functions';
import { formatNumber, formatUpdatedTime } from '@/utils/formatters';

export default function CambiosDetalleClient({ id, meta, initialData, initialHistory, symbol = 'US$' }) {
    const compra = initialData?.compra || 0;
    const venta = initialData?.venta || 0;
    const [amountPesos, setAmountPesos] = useState('');
    const [amountCurrency, setAmountCurrency] = useState('');

    const normalizedSymbol = symbol === 'U$S' ? 'US$' : symbol;

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

    const historyData = initialHistory ? filtrarUltimoMes(initialHistory).reverse() : [];
    const labels = historyData.map(item => item.fecha);
    const values = historyData.map(item => item.venta || item.valor);

    const chartTone = historyData.length > 0
        ? historyData[0].venta < venta
            ? 'up'
            : historyData[0].venta > venta
                ? 'down'
                : 'neutral'
        : 'signal';

    const updatedTime = formatUpdatedTime(initialData?.fechaActualizacion);

    return (
        <section className="space-y-8 animate-fade-in">
            {/* Header: Cotización Actual */}
            <div className="pulso-card flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <p className="label" style={{ color: 'var(--signal-text)', margin: '0 0 var(--space-1) 0' }}>
                        COTIZACIÓN EN TIEMPO REAL {updatedTime ? `· ACTUALIZADO ${updatedTime}` : ''}
                    </p>
                    <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                        {meta.name} hoy
                    </h1>
                </div>

                <div className="flex flex-wrap gap-8">
                    <div>
                        <p className="label" style={{ color: 'var(--ink-subtle)', margin: '0 0 var(--space-1) 0' }}>
                            Compra
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
                            Venta
                        </p>
                        <p className="figure" style={{ color: 'var(--ink)', margin: 0 }}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
                {/* Calculadora */}
                <div className="lg:col-span-1 pulso-card flex flex-col justify-between" style={{ gap: 'var(--space-6)' }}>
                    <div>
                        <h2 className="h2" style={{ color: 'var(--ink)', margin: '0 0 var(--space-1) 0' }}>
                            Conversor de moneda
                        </h2>
                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            Calculá el equivalente en pesos argentinos al tipo de cambio de {meta.name}.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                                    }}
                                >
                                    $
                                </span>
                                <input
                                    type="number"
                                    value={amountPesos}
                                    onChange={(e) => handlePesosChange(e.target.value)}
                                    placeholder="10000"
                                    className="pulso-input data"
                                    style={{ paddingLeft: 'var(--space-8)' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label" style={{ display: 'block', color: 'var(--ink-muted)', marginBottom: 'var(--space-2)' }}>
                                {meta.name} ({normalizedSymbol})
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
                                    {normalizedSymbol}
                                </span>
                                <input
                                    type="number"
                                    value={amountCurrency}
                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                    placeholder="10"
                                    className="pulso-input data"
                                    style={{ paddingLeft: 'var(--space-12)' }}
                                />
                            </div>
                        </div>
                    </div>

                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                        Usa el precio de venta para comprar divisas y el precio de compra para liquidarlas.
                    </p>
                </div>

                {/* Gráfico Histórico */}
                <div className="lg:col-span-2 pulso-card flex flex-col justify-between">
                    <div>
                        <h2 className="h2" style={{ color: 'var(--ink)', margin: '0 0 var(--space-1) 0' }}>
                            Evolución del último mes
                        </h2>
                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            Histórico de cotización diaria del {meta.name}.
                        </p>
                    </div>

                    <div style={{ height: '240px', width: '100%', marginTop: 'var(--space-6)' }}>
                        {historyData.length > 0 ? (
                            <LineChart labels={labels} dataset={values} height={240} color={chartTone} duration="month" showAxes={true} />
                        ) : (
                            <div className="skeleton w-full h-full" />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
