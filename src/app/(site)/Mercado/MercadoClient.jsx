'use client';

import { TickerTape, MarketOverview } from "react-ts-tradingview-widgets";
import { TradingViewContainer } from '@/components/TradingViewContainer';

export default function MercadoClient() {
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
                        TradingView · Tiempo real
                    </p>
                    <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                        Mercados financieros
                    </h1>
                    <p className="body" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                        S&P Merval, acciones locales, índices internacionales, criptomonedas y materias primas.
                    </p>
                </div>
            </header>

            <section style={{ padding: 'var(--space-8) 0' }}>
                <div className="pulso-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div
                        className="overflow-hidden pointer-events-none"
                        style={{
                            border: '1px solid var(--line)',
                            background: 'var(--surface-100)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <TradingViewContainer minHeight="46px">
                            {(activeTheme) => (
                                <TickerTape
                                    colorTheme={activeTheme}
                                    isTransparent={true}
                                    displayMode="regular"
                                    locale="es"
                                    showSymbolLogo={true}
                                    symbols={[
                                        { description: "S&P 500", proName: "SP:SPX" },
                                        { description: "MERVAL", proName: "BCBA:IMV" },
                                        { description: "Bitcoin", proName: "BINANCE:BTCUSDT" },
                                        { description: "Soja", proName: "CAPITALCOM:SOYBEAN" },
                                        { description: "Maíz", proName: "CAPITALCOM:CORN" },
                                        { description: "Petróleo WTI", proName: "TVC:USOIL" },
                                        { description: "Oro", proName: "OANDA:XAUUSD" },
                                        { description: "Cobre", proName: "OANDA:XCUUSD" },
                                    ]}
                                />
                            )}
                        </TradingViewContainer>
                    </div>

                    <div
                        className="overflow-hidden"
                        style={{
                            border: '1px solid var(--line)',
                            background: 'var(--surface-100)',
                            borderRadius: 'var(--radius-md)',
                            height: '720px',
                        }}
                    >
                        <TradingViewContainer height="720px">
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
                                            title: "Mercado Argentino",
                                            symbols: [
                                                { s: "BCBA:IMV", d: "S&P Merval" },
                                                { s: "BCBA:GGAL", d: "Grupo Financiero Galicia" },
                                                { s: "BCBA:YPFD", d: "YPF S.A." },
                                                { s: "BCBA:PAMP", d: "Pampa Energía" },
                                                { s: "BCBA:BMA", d: "Banco Macro" },
                                                { s: "BCBA:CEPU", d: "Central Puerto" },
                                                { s: "BCBA:TXAR", d: "Ternium Argentina" },
                                                { s: "BCBA:ALUA", d: "Aluar" },
                                                { s: "BCBA:COME", d: "Soc. Comercial del Plata" },
                                                { s: "BCBA:TECO2", d: "Telecom Argentina" },
                                            ],
                                        },
                                        {
                                            title: "Internacional",
                                            symbols: [
                                                { s: "AMEX:SPY", d: "SPDR S&P 500 ETF" },
                                                { s: "NASDAQ:QQQ", d: "Invesco QQQ Trust" },
                                                { s: "NASDAQ:AAPL", d: "Apple Inc." },
                                                { s: "NASDAQ:MSFT", d: "Microsoft Corp." },
                                                { s: "NASDAQ:NVDA", d: "NVIDIA Corp." },
                                                { s: "NASDAQ:TSLA", d: "Tesla Inc." },
                                                { s: "NASDAQ:AMZN", d: "Amazon.com" },
                                                { s: "NASDAQ:META", d: "Meta Platforms" },
                                                { s: "NASDAQ:GOOGL", d: "Alphabet Inc." },
                                                { s: "NYSE:BRK.B", d: "Berkshire Hathaway" },
                                            ],
                                        },
                                        {
                                            title: "Materias primas",
                                            symbols: [
                                                { s: "CAPITALCOM:SOYBEAN", d: "Soja" },
                                                { s: "CAPITALCOM:CORN", d: "Maíz" },
                                                { s: "CAPITALCOM:WHEAT", d: "Trigo" },
                                                { s: "TVC:USOIL", d: "Petróleo WTI" },
                                                { s: "TVC:UKOIL", d: "Petróleo Brent" },
                                                { s: "CAPITALCOM:NATURALGAS", d: "Gas Natural" },
                                                { s: "OANDA:XAUUSD", d: "Oro" },
                                                { s: "OANDA:XAGUSD", d: "Plata" },
                                                { s: "OANDA:XCUUSD", d: "Cobre" },
                                            ],
                                        },
                                        {
                                            title: "Criptomonedas",
                                            symbols: [
                                                { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
                                                { s: "BINANCE:ETHUSDT", d: "Ethereum" },
                                                { s: "BINANCE:SOLUSDT", d: "Solana" },
                                                { s: "BINANCE:BNBUSDT", d: "BNB" },
                                                { s: "BINANCE:ADAUSDT", d: "Cardano" },
                                                { s: "BINANCE:XRPUSDT", d: "Ripple" },
                                                { s: "BINANCE:DOGEUSDT", d: "Dogecoin" },
                                                { s: "BINANCE:AVAXUSDT", d: "Avalanche" },
                                                { s: "BINANCE:LINKUSDT", d: "Chainlink" },
                                                { s: "BINANCE:DOTUSDT", d: "Polkadot" },
                                            ],
                                        },
                                    ]}
                                />
                            )}
                        </TradingViewContainer>
                    </div>

                    <p className="body-sm text-center" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                        Datos de mercado provistos en tiempo real vía{' '}
                        <a
                            href="https://tradingview.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: 'var(--signal-text)' }}
                        >
                            TradingView
                        </a>
                        . Información con fines informativos. No es una recomendación de inversión.
                    </p>
                </div>
            </section>
        </main>
    );
}
