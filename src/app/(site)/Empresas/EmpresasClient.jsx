'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TechnicalAnalysis, MiniChart, CompanyProfile, FundamentalData, Timeline, SymbolInfo } from 'react-ts-tradingview-widgets';
import { TradingViewContainer } from '@/components/TradingViewContainer';

const CATEGORIES = [
    {
        name: 'Argentina',
        companies: [
            { symbol: 'GGAL.BA',  name: 'Galicia', tvSymbol: 'BCBA:GGAL' },
            { symbol: 'YPFD.BA',  name: 'YPF', tvSymbol: 'BCBA:YPFD' },
            { symbol: 'PAMP.BA',  name: 'Pampa Energía', tvSymbol: 'BCBA:PAMP' },
            { symbol: 'BMA.BA',   name: 'Banco Macro', tvSymbol: 'BCBA:BMA' },
            { symbol: 'BBAR.BA',  name: 'BBVA', tvSymbol: 'BCBA:BBAR' },
            { symbol: 'CEPU.BA',  name: 'Central Puerto', tvSymbol: 'BCBA:CEPU' },
            { symbol: 'LOMA.BA',  name: 'Loma Negra', tvSymbol: 'BCBA:LOMA' },
            { symbol: 'CRES.BA',  name: 'Cresud', tvSymbol: 'BCBA:CRES' },
            { symbol: 'IRSA.BA',  name: 'IRSA', tvSymbol: 'BCBA:IRSA' },
            { symbol: 'TGSU2.BA', name: 'TGS', tvSymbol: 'BCBA:TGSU2' },
            { symbol: 'ALUA.BA',  name: 'Aluar', tvSymbol: 'BCBA:ALUA' },
            { symbol: 'TXAR.BA',  name: 'Ternium', tvSymbol: 'BCBA:TXAR' },
        ]
    },
    {
        name: 'Internacional',
        companies: [
            { symbol: 'MELI',     name: 'Mercado Libre', tvSymbol: 'NASDAQ:MELI' },
            { symbol: 'AAPL',     name: 'Apple', tvSymbol: 'NASDAQ:AAPL' },
            { symbol: 'MSFT',     name: 'Microsoft', tvSymbol: 'NASDAQ:MSFT' },
            { symbol: 'NVDA',     name: 'NVIDIA', tvSymbol: 'NASDAQ:NVDA' },
            { symbol: 'TSLA',     name: 'Tesla', tvSymbol: 'NASDAQ:TSLA' },
            { symbol: 'AMZN',     name: 'Amazon', tvSymbol: 'NASDAQ:AMZN' },
            { symbol: 'GOOGL',    name: 'Alphabet', tvSymbol: 'NASDAQ:GOOGL' },
            { symbol: 'META',     name: 'Meta', tvSymbol: 'NASDAQ:META' },
            { symbol: 'TSM',      name: 'TSMC', tvSymbol: 'NYSE:TSM' },
            { symbol: 'KO',       name: 'Coca-Cola', tvSymbol: 'NYSE:KO' },
            { symbol: 'WMT',      name: 'Walmart', tvSymbol: 'NYSE:WMT' },
            { symbol: 'NU',       name: 'Nubank', tvSymbol: 'NYSE:NU' },
            { symbol: 'BRK-B',    name: 'Berkshire', tvSymbol: 'NYSE:BRK.B' },
            { symbol: 'NFLX',     name: 'Netflix', tvSymbol: 'NASDAQ:NFLX' },
        ]
    }
];

export default function EmpresasClient() {
    const [selectedSymbol, setSelectedSymbol] = useState(CATEGORIES[0].companies[0].symbol);
    
    const selectedCompany = [...CATEGORIES[0].companies, ...CATEGORIES[1].companies].find(c => c.symbol === selectedSymbol);
    const tvSymbol = selectedCompany?.tvSymbol;

    useEffect(() => {
        if (selectedSymbol) {
            localStorage.setItem('lastViewedCompany', selectedSymbol);
        }
    }, [selectedSymbol]);

    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            <header
                style={{
                    borderBottom: '1px solid var(--line)',
                    padding: 'var(--space-8) 0',
                }}
            >
                <div className="pulso-container flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="label" style={{ color: 'var(--signal-text)', margin: '0 0 var(--space-2) 0' }}>
                            ANÁLISIS FUNDAMENTAL · BYMA · NYSE · NASDAQ
                        </p>
                        <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                            Terminal de empresas
                        </h1>
                        <p className="body" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                            Métricas fundamentales, perfil corporativo y cotizaciones de acciones argentinas y CEDEARs.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {selectedCompany && (
                            <Link
                                href={`/Empresas/${encodeURIComponent(selectedCompany.symbol)}`}
                                className="pulso-btn pulso-btn--secondary"
                            >
                                Ver ficha de {selectedCompany.name}
                            </Link>
                        )}
                        <Link href="/Cartera" className="pulso-btn pulso-btn--primary">
                            Simular en mi cartera
                        </Link>
                    </div>
                </div>
            </header>

            <section style={{ padding: 'var(--space-8) 0' }}>
                <div className="pulso-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div className="pulso-card">
                        <div className="flex flex-col md:flex-row" style={{ gap: 'var(--space-6)' }}>
                            {CATEGORIES.map((category) => (
                                <div key={category.name} className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    <h2 className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                                        {category.name}
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {category.companies.map((company) => (
                                            <button
                                                key={company.symbol}
                                                type="button"
                                                onClick={() => setSelectedSymbol(company.symbol)}
                                                className={selectedSymbol === company.symbol ? 'pill-active' : 'pill-inactive'}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {company.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 items-start" style={{ gap: 'var(--space-6)' }}>
                        <div
                            className="col-span-1 lg:col-span-12 overflow-hidden"
                            style={{
                                background: 'var(--surface-100)',
                                border: '1px solid var(--line)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <TradingViewContainer minHeight="160px">
                                {(activeTheme) => (
                                    <SymbolInfo key={`sym-${tvSymbol}-${activeTheme}`} symbol={tvSymbol} colorTheme={activeTheme} width="100%" locale="es" isTransparent />
                                )}
                            </TradingViewContainer>
                        </div>

                        <div className="col-span-1 lg:col-span-8 flex flex-col" style={{ gap: 'var(--space-6)' }}>
                            <div
                                className="overflow-hidden"
                                style={{
                                    background: 'var(--surface-100)',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-2)',
                                }}
                            >
                                <div className="h-[300px] w-full">
                                    <TradingViewContainer height="300px">
                                        {(activeTheme) => (
                                            <CompanyProfile key={`profile-${tvSymbol}-${activeTheme}`} symbol={tvSymbol} colorTheme={activeTheme} width="100%" height="100%" locale="es" isTransparent />
                                        )}
                                    </TradingViewContainer>
                                </div>
                            </div>

                            <div
                                className="overflow-hidden"
                                style={{
                                    background: 'var(--surface-100)',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-2)',
                                }}
                            >
                                <div className="h-[450px] w-full">
                                    <TradingViewContainer height="450px">
                                        {(activeTheme) => (
                                            <FundamentalData key={`fund-${tvSymbol}-${activeTheme}`} symbol={tvSymbol} colorTheme={activeTheme} width="100%" height="100%" locale="es" isTransparent displayMode="compact" />
                                        )}
                                    </TradingViewContainer>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-1 lg:col-span-4 flex flex-col" style={{ gap: 'var(--space-6)' }}>
                            <div
                                className="overflow-hidden"
                                style={{
                                    background: 'var(--surface-100)',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-4)',
                                }}
                            >
                                <h3 className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-2)' }}>
                                    Indicadores técnicos
                                </h3>
                                <div className="h-[380px] w-full">
                                    <TradingViewContainer height="380px">
                                        {(activeTheme) => (
                                            <TechnicalAnalysis key={`ta-${tvSymbol}-${activeTheme}`} symbol={tvSymbol} colorTheme={activeTheme} width="100%" height="100%" locale="es" isTransparent />
                                        )}
                                    </TradingViewContainer>
                                </div>
                            </div>

                            <div
                                className="overflow-hidden"
                                style={{
                                    background: 'var(--surface-100)',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-4)',
                                }}
                            >
                                <h3 className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-2)' }}>
                                    Rendimiento reciente
                                </h3>
                                <div className="h-[150px] w-full">
                                    <TradingViewContainer height="150px">
                                        {(activeTheme) => (
                                            <MiniChart key={`mini-${tvSymbol}-${activeTheme}`} symbol={tvSymbol} colorTheme={activeTheme} width="100%" height="100%" locale="es" isTransparent />
                                        )}
                                    </TradingViewContainer>
                                </div>
                            </div>

                            <div
                                className="overflow-hidden flex-1"
                                style={{
                                    background: 'var(--surface-100)',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--radius-md)',
                                    minHeight: '350px',
                                }}
                            >
                                <h3 className="label" style={{ color: 'var(--ink-subtle)', padding: 'var(--space-4) var(--space-4) 0', margin: 0 }}>
                                    Noticias de la empresa
                                </h3>
                                <TradingViewContainer height="350px">
                                    {(activeTheme) => (
                                        <Timeline key={`timeline-${tvSymbol}-${activeTheme}`} feedMode="symbol" symbol={tvSymbol} colorTheme={activeTheme} width="100%" height="100%" locale="es" isTransparent />
                                    )}
                                </TradingViewContainer>
                            </div>
                        </div>
                    </div>

                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', textAlign: 'center', paddingTop: 'var(--space-4)', margin: 0 }}>
                        Datos provistos por TradingView. Información con fines informativos. No es una recomendación de inversión.
                    </p>
                </div>
            </section>
        </main>
    );
}
