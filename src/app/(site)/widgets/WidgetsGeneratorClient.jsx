'use client';

import React, { useState } from 'react';

export default function WidgetsGeneratorClient() {
    const [selectedWidget, setSelectedWidget] = useState('dolar-blue');
    const [theme, setTheme] = useState('dark');
    const [copied, setCopied] = useState(false);

    const WIDGETS = [
        {
            id: 'dolar-blue',
            title: 'Dólar blue compacto',
            desc: 'Tarjeta mínima con precio de compra y venta del dólar paralelo.',
            path: '/widgets/dolar-blue',
            attrHref: '/Cambios/dolar-blue',
            attrText: 'Dólar blue hoy',
            height: '170px',
            width: '320px'
        },
        {
            id: 'multi-dolar',
            title: 'Monitor multi-dólar',
            desc: 'Tabla comparativa con dólar blue, oficial, MEP y CCL.',
            path: '/widgets/multi-dolar',
            attrHref: '/Cambios',
            attrText: 'Cotización del dólar hoy',
            height: '320px',
            width: '360px'
        },
        {
            id: 'mini-cartera',
            title: 'Mini-cartera de acciones',
            desc: 'Cuatro activos de referencia del mercado argentino con tickers y sectores.',
            path: '/widgets/mini-cartera',
            attrHref: '/Empresas',
            attrText: 'Cotización de acciones argentinas',
            height: '300px',
            width: '360px'
        }
    ];

    const currentConfig = WIDGETS.find(w => w.id === selectedWidget) || WIDGETS[0];
    const iframeSrc = `https://www.infopeso.com.ar${currentConfig.path}?theme=${theme}`;
    const embedCode = `<iframe src="${iframeSrc}" width="100%" height="${currentConfig.height}" style="border:none;border-radius:10px;max-width:${currentConfig.width};display:block;" title="Cotizaciones en vivo por Infopeso"></iframe>\n<p style="font-size:11px;margin-top:4px;">Datos de <a href="https://www.infopeso.com.ar${currentConfig.attrHref}" target="_blank" rel="noopener" style="text-decoration:underline;font-weight:600;">${currentConfig.attrText}</a> en Infopeso</p>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start" style={{ gap: 'var(--space-8)' }}>
            {/* Controls */}
            <div className="lg:col-span-6 pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                    1. Configurá tu widget
                </h2>

                {/* Select widget type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <label className="label" style={{ color: 'var(--ink-subtle)' }}>
                        Tipo de cotización
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 'var(--space-3)' }}>
                        {WIDGETS.map((w) => {
                            const active = selectedWidget === w.id;
                            return (
                                <button
                                    key={w.id}
                                    type="button"
                                    onClick={() => setSelectedWidget(w.id)}
                                    style={{
                                        padding: 'var(--space-3)',
                                        borderRadius: 'var(--radius-sm)',
                                        textAlign: 'left',
                                        background: active ? 'var(--surface-200)' : 'var(--ground-000)',
                                        border: active ? '1px solid var(--ink)' : '1px solid var(--line)',
                                        color: 'var(--ink)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body-sm)', fontWeight: 700 }}>
                                        {w.title}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-muted)', marginTop: 'var(--space-1)', lineHeight: 1.35 }}>
                                        {w.desc}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Theme selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <label className="label" style={{ color: 'var(--ink-subtle)' }}>
                        Tema visual
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setTheme('dark')}
                            className={theme === 'dark' ? 'pill-active' : 'pill-inactive'}
                            style={{ cursor: 'pointer' }}
                        >
                            Modo oscuro (Dark)
                        </button>
                        <button
                            type="button"
                            onClick={() => setTheme('light')}
                            className={theme === 'light' ? 'pill-active' : 'pill-inactive'}
                            style={{ cursor: 'pointer' }}
                        >
                            Modo claro (Light)
                        </button>
                    </div>
                </div>

                {/* Embed code output */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--line)' }}>
                    <div className="flex items-center justify-between gap-2">
                        <label className="label" style={{ color: 'var(--ink-subtle)' }}>
                            Código HTML para insertar
                        </label>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="pulso-btn pulso-btn--primary"
                            style={{ height: '40px' }}
                        >
                            {copied ? 'Código copiado' : 'Copiar código'}
                        </button>
                    </div>
                    <pre
                        className="data overflow-x-auto"
                        style={{
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--ground-000)',
                            border: '1px solid var(--line)',
                            color: 'var(--ink-muted)',
                            fontSize: '12px',
                            margin: 0,
                        }}
                    >
                        {embedCode}
                    </pre>
                </div>
            </div>

            {/* Live Preview */}
            <div
                className="lg:col-span-6 pulso-card flex flex-col items-center justify-center"
                style={{ minHeight: '400px', gap: 'var(--space-4)' }}
            >
                <div className="w-full flex items-center justify-between">
                    <span className="label" style={{ color: 'var(--ink-subtle)' }}>
                        Vista previa en vivo
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)' }}>
                        {currentConfig.width} × {currentConfig.height}
                    </span>
                </div>

                <div
                    className="w-full flex flex-col items-center justify-center"
                    style={{
                        padding: 'var(--space-6)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px dashed var(--line)',
                        background: 'var(--ground-000)',
                    }}
                >
                    <iframe
                        src={`${currentConfig.path}?theme=${theme}`}
                        width="100%"
                        height={currentConfig.height}
                        style={{
                            maxWidth: currentConfig.width,
                            border: 'none',
                            borderRadius: '10px',
                            display: 'block',
                        }}
                        title="Vista previa del widget"
                    />
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', marginTop: 'var(--space-3)', marginBottom: 0 }}>
                        Cotizaciones provistas por <strong style={{ color: 'var(--signal-text)' }}>Infopeso</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
