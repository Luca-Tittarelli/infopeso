'use client';

import { useEffect, useState } from 'react';
import { filtrarUltimoMes, getDatesRange, getYesterdayDate } from '@/utils/functions';
import { fetchData } from '@/utils/Fetch';
import { dolarFechaAPI, variableAPI, RiesgoPaisHistoricoAPI } from '@/apis';
import { ErrorComponent } from '@/components/Error';
import { indexCategories } from '@/MacroFilters';
import { useDolar } from '@/hooks/useDolar';
import { useMacro } from '@/hooks/useMacro';
import Link from 'next/link';
import { MiniChart, MarketData } from 'react-ts-tradingview-widgets';
import { NewsFeed } from '@/components/news/NewsFeed';
import { TradingViewContainer } from '@/components/TradingViewContainer';
import { QuoteCard } from '@/components/pulso/QuoteCard';
import { Button } from '@/components/pulso/Button';
import { Delta } from '@/components/pulso/Delta';
import { formatCurrency, formatNumber, formatUpdatedTime, isValidNumber } from '@/utils/formatters';

const CASA_SLUGS = {
    blue: 'dolar-blue',
    oficial: 'dolar-oficial',
    bolsa: 'dolar-mep',
    contadoconliqui: 'dolar-ccl',
    tarjeta: 'dolar-tarjeta',
    mayorista: 'dolar-mayorista',
    cripto: 'dolar-cripto',
};

function SectionHeader({ kicker, title, actionHref, actionLabel }) {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                paddingBottom: 'var(--space-3)',
                borderBottom: '1px solid var(--line)',
            }}
        >
            <div>
                {kicker && (
                    <p className="label" style={{ color: 'var(--ink-subtle)', margin: '0 0 var(--space-1) 0' }}>
                        {kicker}
                    </p>
                )}
                <h2 className="h1" style={{ margin: 0, color: 'var(--ink)' }}>
                    {title}
                </h2>
            </div>
            {actionHref && actionLabel && (
                <Link
                    href={actionHref}
                    className="label"
                    style={{
                        color: 'var(--signal-text)',
                        textDecoration: 'none',
                    }}
                >
                    {actionLabel} →
                </Link>
            )}
        </div>
    );
}

export default function IndexClient({
    initialDolar,
    initialVariables,
    initialHistoricalMacro = null,
    initialHistoricalDolar = null,
    initialNews = null,
}) {
    const [lastMacro, setLastMacro] = useState(initialHistoricalMacro || []);
    const [lastDolar, setLastDolar] = useState(initialHistoricalDolar || []);
    const [isHistoricalMacroLoading, setIsHistoricalMacroLoading] = useState(
        !initialHistoricalMacro || initialHistoricalMacro.length === 0
    );
    const [isHistoricalDolarLoading, setIsHistoricalDolarLoading] = useState(
        !initialHistoricalDolar || initialHistoricalDolar.length === 0
    );
    const { dolar, dolarStatus } = useDolar(initialDolar);
    const { variables, variablesStatus } = useMacro(initialVariables);

    const filter = (ids, arr) => arr?.filter((item) => ids.includes(item.idVariable)) || [];

    const macroData = variables || [];
    const findMacro = (id) => macroData.find((v) => String(v.idVariable) === String(id));

    const riesgoPaisVar = findMacro('riesgo-pais');
    const tasaVar = findMacro(44);
    const baseVar = findMacro(15);
    const inflacionVar = findMacro(27);
    const reservasVar = findMacro(1);

    const calcDelta = (curr, prev, isAbs = false) => {
        if (!isValidNumber(curr) || !isValidNumber(prev) || Number(prev) === 0) return null;
        return isAbs
            ? Number(curr) - Number(prev)
            : ((Number(curr) - Number(prev)) / Math.abs(Number(prev))) * 100;
    };

    const findLastMacro = (id) => lastMacro.find((m) => String(m.idVariable) === String(id));

    const rpLast = findLastMacro('riesgo-pais');
    const tasaLast = findLastMacro(44);
    const baseLast = findLastMacro(15);
    const inflacionLast = findLastMacro(27);
    const reservasLast = findLastMacro(1);

    const rpDelta = calcDelta(riesgoPaisVar?.valor, rpLast?.valor, true);
    const tasaDelta = calcDelta(tasaVar?.valor, tasaLast?.valor);
    const baseDelta = calcDelta(baseVar?.valor, baseLast?.valor);
    const inflaDelta = calcDelta(inflacionVar?.valor, inflacionLast?.valor, true);
    const reservasDelta = calcDelta(reservasVar?.valor, reservasLast?.valor);

    const dolarList = dolar || [];
    const findDolar = (casa) => dolarList.find((d) => d.casa === casa);
    const findLastDolar = (casa) => lastDolar.find((d) => d.casa === casa);

    const blueDolar = findDolar('blue');
    const mepDolar = findDolar('bolsa');
    const blueDelta = calcDelta(blueDolar?.venta, findLastDolar('blue')?.venta);
    const mepDelta = calcDelta(mepDolar?.venta, findLastDolar('bolsa')?.venta);

    useEffect(() => {
        if (initialHistoricalMacro && initialHistoricalMacro.length > 0) return;
        if (variablesStatus === 'loading') return;
        if (variablesStatus === 'error' || !variables || variables.length === 0) {
            setIsHistoricalMacroLoading(false);
            return;
        }

        const fetchAllMacro = async () => {
            try {
                const targets = filter(indexCategories, variables);
                const promises = targets.map(async (i) => {
                    const id = i.idVariable;
                    try {
                        if (id === 'riesgo-pais') {
                            const res = await fetchData(RiesgoPaisHistoricoAPI);
                            const rp = filtrarUltimoMes(res.data)[0];
                            return { idVariable: 'riesgo-pais', valor: rp?.valor };
                        } else {
                            const dates = getDatesRange();
                            const res = await fetchData(variableAPI(id, dates[0], dates[1]));
                            const obj = res.data.results?.[0];
                            if (obj?.detalle?.length > 0) {
                                return { idVariable: obj.idVariable, valor: obj.detalle[0].valor };
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching macro index:', id, err);
                    }
                    return null;
                });

                const results = await Promise.all(promises);
                setLastMacro(results.filter(Boolean));
            } catch (err) {
                console.error('Error fetching macro historicals:', err);
            } finally {
                setIsHistoricalMacroLoading(false);
            }
        };

        fetchAllMacro();
    }, [variables, variablesStatus, initialHistoricalMacro]);

    useEffect(() => {
        if (initialHistoricalDolar && initialHistoricalDolar.length > 0) return;
        if (dolarStatus === 'loading') return;
        if (dolarStatus === 'error' || !dolar || dolar.length === 0) {
            setIsHistoricalDolarLoading(false);
            return;
        }

        const fetchAllDolar = async () => {
            try {
                const promises = dolar.map(async (item) => {
                    try {
                        const res = await fetchData(
                            dolarFechaAPI(item.casa, getYesterdayDate().replace(/-/g, '/'))
                        );
                        return res.data;
                    } catch (err) {
                        console.error('Error fetching historical dollar for:', item.casa, err);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                setLastDolar(results.filter(Boolean));
            } catch (err) {
                console.error('Error fetching dollar historicals:', err);
            } finally {
                setIsHistoricalDolarLoading(false);
            }
        };

        fetchAllDolar();
    }, [dolar, dolarStatus, initialHistoricalDolar]);

    const isLoading =
        dolarStatus === 'loading' ||
        variablesStatus === 'loading' ||
        isHistoricalDolarLoading ||
        isHistoricalMacroLoading;

    const hasError = dolarStatus === 'error' || variablesStatus === 'error';

    return (
        <main style={{ minHeight: '100vh', paddingBottom: 'var(--space-16)' }}>
            {/* Portada / Hero */}
            <section
                style={{
                    paddingTop: 'var(--space-12)',
                    paddingBottom: 'var(--space-8)',
                    borderBottom: '1px solid var(--line)',
                }}
            >
                <div className="pulso-container">
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            gap: 'var(--space-6)',
                        }}
                    >
                        <div style={{ maxWidth: '720px' }}>
                            <p className="label" style={{ color: 'var(--ink-subtle)', margin: '0 0 var(--space-3) 0' }}>
                                PULSO FINANCIERO ARGENTINO · TIEMPO REAL
                            </p>
                            <h1 className="display-xl" style={{ margin: '0 0 var(--space-4) 0' }}>
                                Leé el mercado.
                            </h1>
                            <p className="body" style={{ color: 'var(--ink-muted)', margin: 0, maxWidth: '580px' }}>
                                Seguí el dólar, la inflación, el riesgo país y probá cómo rinde tu cartera en pesos y dólares con datos verificables.
                            </p>
                        </div>

                        {/* Única acción principal naranja de la pantalla */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                            <Button variant="primary" href="/Cartera">
                                Crear mi cartera
                            </Button>
                            <Button variant="secondary" href="/Cambios">
                                Ver cotizaciones
                            </Button>
                        </div>
                    </div>

                    {/* Grilla protagonista: 4 QuoteCards principales */}
                    <div
                        style={{
                            marginTop: 'var(--space-8)',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: 'var(--space-4)',
                        }}
                    >
                        <QuoteCard
                            label="DÓLAR BLUE · VENTA"
                            value={blueDolar?.venta}
                            prefix="$"
                            decimals={2}
                            delta={blueDelta}
                            deltaUnit="%"
                            updatedAt={blueDolar?.fechaActualizacion}
                            secondaryLabel={blueDolar?.compra ? `COMPRA ${formatCurrency(blueDolar.compra, 'ARS')}` : ''}
                            href="/Cambios/dolar-blue"
                            loading={isLoading}
                        />
                        <QuoteCard
                            label="DÓLAR MEP · VENTA"
                            value={mepDolar?.venta}
                            prefix="$"
                            decimals={2}
                            delta={mepDelta}
                            deltaUnit="%"
                            updatedAt={mepDolar?.fechaActualizacion}
                            secondaryLabel={mepDolar?.compra ? `COMPRA ${formatCurrency(mepDolar.compra, 'ARS')}` : ''}
                            href="/Cambios/dolar-mep"
                            loading={isLoading}
                        />
                        <QuoteCard
                            label="RIESGO PAÍS · EMBI+"
                            value={riesgoPaisVar?.valor}
                            suffix="pb"
                            decimals={0}
                            delta={rpDelta}
                            deltaUnit="pb"
                            deltaDecimals={0}
                            updatedAt={riesgoPaisVar?.fecha}
                            href="/Economia/riesgo-pais"
                            loading={isLoading}
                        />
                        <QuoteCard
                            label="INFLACIÓN MENSUAL · INDEC"
                            value={inflacionVar?.valor}
                            suffix="%"
                            decimals={1}
                            delta={inflaDelta}
                            deltaUnit="pp"
                            deltaDecimals={1}
                            updatedAt={inflacionVar?.fecha}
                            href="/Economia/27"
                            loading={isLoading}
                        />
                    </div>
                </div>
            </section>

            {hasError && (
                <section style={{ paddingTop: 'var(--space-8)' }}>
                    <div className="pulso-container">
                        <ErrorComponent message="No pudimos actualizar algunos indicadores en vivo." />
                    </div>
                </section>
            )}

            {/* Sección: Pizarra completa del Dólar + Indicadores del BCRA */}
            <section style={{ paddingTop: 'var(--space-12)' }}>
                <div className="pulso-container">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: 'var(--space-8)',
                            alignItems: 'start',
                        }}
                    >
                        {/* Columna 1: Tabla de Tipos de Cambio */}
                        <div>
                            <SectionHeader
                                kicker="DOLARAPI · COMPRA Y VENTA"
                                title="Tipos de cambio"
                                actionHref="/Cambios"
                                actionLabel="Ver calculadoras"
                            />

                            <div
                                style={{
                                    background: 'var(--surface-100)',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--radius-md)',
                                    overflowX: 'auto',
                                }}
                            >
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                                    <thead>
                                        <tr>
                                            <th
                                                scope="col"
                                                className="label"
                                                style={{
                                                    color: 'var(--ink-subtle)',
                                                    textAlign: 'left',
                                                    padding: 'var(--space-3) var(--space-4)',
                                                    borderBottom: '1px solid var(--line)',
                                                }}
                                            >
                                                Cotización
                                            </th>
                                            <th
                                                scope="col"
                                                className="label"
                                                style={{
                                                    color: 'var(--ink-subtle)',
                                                    textAlign: 'right',
                                                    padding: 'var(--space-3) var(--space-4)',
                                                    borderBottom: '1px solid var(--line)',
                                                }}
                                            >
                                                Compra
                                            </th>
                                            <th
                                                scope="col"
                                                className="label"
                                                style={{
                                                    color: 'var(--ink-subtle)',
                                                    textAlign: 'right',
                                                    padding: 'var(--space-3) var(--space-4)',
                                                    borderBottom: '1px solid var(--line)',
                                                }}
                                            >
                                                Venta
                                            </th>
                                            <th
                                                scope="col"
                                                className="label"
                                                style={{
                                                    color: 'var(--ink-subtle)',
                                                    textAlign: 'right',
                                                    padding: 'var(--space-3) var(--space-4)',
                                                    borderBottom: '1px solid var(--line)',
                                                }}
                                            >
                                                Var. diaria
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            [1, 2, 3, 4, 5, 6].map((i) => (
                                                <tr key={i}>
                                                    <td colSpan={4} style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--line)' }}>
                                                        <div className="skeleton" style={{ height: '20px', width: '100%' }} />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            dolarList.map((item, idx) => {
                                                const lastVal = findLastDolar(item.casa)?.venta;
                                                const diff = calcDelta(item.venta, lastVal);
                                                const slug = CASA_SLUGS[item.casa] || `dolar-${item.casa}`;
                                                const isLast = idx === dolarList.length - 1;
                                                return (
                                                    <tr
                                                        key={item.casa || idx}
                                                        style={{ transition: 'background-color 150ms ease-out' }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = 'var(--surface-200)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'transparent';
                                                        }}
                                                    >
                                                        <td
                                                            style={{
                                                                padding: 'var(--space-3) var(--space-4)',
                                                                borderBottom: isLast ? '0' : '1px solid var(--line)',
                                                                textAlign: 'left',
                                                            }}
                                                        >
                                                            <Link
                                                                href={`/Cambios/${slug}`}
                                                                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        display: 'block',
                                                                        fontFamily: 'var(--font-display)',
                                                                        fontWeight: 700,
                                                                        fontSize: '15px',
                                                                        lineHeight: 1.2,
                                                                        color: 'var(--ink)',
                                                                    }}
                                                                >
                                                                    {item.nombre}
                                                                </span>
                                                                <span
                                                                    style={{
                                                                        display: 'block',
                                                                        fontFamily: 'var(--font-mono)',
                                                                        fontSize: '11px',
                                                                        color: 'var(--ink-subtle)',
                                                                    }}
                                                                >
                                                                    {formatUpdatedTime(item.fechaActualizacion)}
                                                                </span>
                                                            </Link>
                                                        </td>
                                                        <td
                                                            className="data"
                                                            style={{
                                                                padding: 'var(--space-3) var(--space-4)',
                                                                borderBottom: isLast ? '0' : '1px solid var(--line)',
                                                                textAlign: 'right',
                                                                color: 'var(--ink-muted)',
                                                            }}
                                                        >
                                                            {item.compra ? formatCurrency(item.compra, 'ARS') : '—'}
                                                        </td>
                                                        <td
                                                            className="data"
                                                            style={{
                                                                padding: 'var(--space-3) var(--space-4)',
                                                                borderBottom: isLast ? '0' : '1px solid var(--line)',
                                                                textAlign: 'right',
                                                                color: 'var(--ink)',
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {item.venta ? formatCurrency(item.venta, 'ARS') : '—'}
                                                        </td>
                                                        <td
                                                            className="data"
                                                            style={{
                                                                padding: 'var(--space-3) var(--space-4)',
                                                                borderBottom: isLast ? '0' : '1px solid var(--line)',
                                                                textAlign: 'right',
                                                            }}
                                                        >
                                                            <Delta value={diff} unit="%" compact={true} pill={false} />
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Columna 2: Variables Monetarias del BCRA */}
                        <div>
                            <SectionHeader
                                kicker="BCRA · ESTADÍSTICAS MONETARIAS"
                                title="Variables del Banco Central"
                                actionHref="/Economia"
                                actionLabel="Ver todas las series"
                            />

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: 'var(--space-4)',
                                }}
                            >
                                <QuoteCard
                                    label="TASA POLÍTICA MONETARIA · TNA"
                                    value={tasaVar?.valor}
                                    suffix="%"
                                    decimals={2}
                                    delta={tasaDelta}
                                    deltaUnit="%"
                                    updatedAt={tasaVar?.fecha}
                                    href="/Economia/44"
                                    loading={isLoading}
                                />
                                <QuoteCard
                                    label="RESERVAS BCRA · MILLONES"
                                    value={reservasVar?.valor}
                                    prefix="US$"
                                    decimals={0}
                                    delta={reservasDelta}
                                    deltaUnit="%"
                                    updatedAt={reservasVar?.fecha}
                                    href="/Economia/1"
                                    loading={isLoading}
                                />
                                <QuoteCard
                                    label="BASE MONETARIA · MILLONES"
                                    value={baseVar?.valor}
                                    prefix="$"
                                    decimals={0}
                                    delta={baseDelta}
                                    deltaUnit="%"
                                    updatedAt={baseVar?.fecha}
                                    href="/Economia/15"
                                    loading={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección: Mercado local e internacional */}
            <section style={{ paddingTop: 'var(--space-12)' }}>
                <div className="pulso-container">
                    <SectionHeader
                        kicker="BYMA · WALL STREET · COMMODITIES"
                        title="Pulso de mercado"
                        actionHref="/Mercado"
                        actionLabel="Abrir panel de mercado"
                    />

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: 'var(--space-6)',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div
                                style={{
                                    background: 'var(--surface-100)',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        padding: 'var(--space-4) var(--space-6) 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span className="label" style={{ color: 'var(--ink-subtle)' }}>
                                        S&P MERVAL · BCBA:IMV
                                    </span>
                                    <Link href="/Mercado" className="label" style={{ color: 'var(--signal-text)', textDecoration: 'none' }}>
                                        MERCADO →
                                    </Link>
                                </div>
                                <div style={{ height: '165px' }}>
                                    <TradingViewContainer height="165px">
                                        {(activeTheme) => (
                                            <MiniChart
                                                colorTheme={activeTheme}
                                                width="100%"
                                                height="100%"
                                                symbol="BCBA:IMV"
                                                locale="es"
                                                isTransparent={true}
                                            />
                                        )}
                                    </TradingViewContainer>
                                </div>
                            </div>

                            <div
                                style={{
                                    background: 'var(--surface-100)',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        padding: 'var(--space-4) var(--space-6) 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span className="label" style={{ color: 'var(--ink-subtle)' }}>
                                        BONO BONAR 2030 · BCBA:AL30
                                    </span>
                                    <Link href="/RentaFija/AL30" className="label" style={{ color: 'var(--signal-text)', textDecoration: 'none' }}>
                                        CALCULAR TIR →
                                    </Link>
                                </div>
                                <div style={{ height: '165px' }}>
                                    <TradingViewContainer height="165px">
                                        {(activeTheme) => (
                                            <MiniChart
                                                colorTheme={activeTheme}
                                                width="100%"
                                                height="100%"
                                                symbol="BCBA:AL30"
                                                locale="es"
                                                isTransparent={true}
                                            />
                                        )}
                                    </TradingViewContainer>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                background: 'var(--surface-100)',
                                border: '1px solid var(--line)',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                minHeight: '380px',
                            }}
                        >
                            <TradingViewContainer height="100%" minHeight="380px">
                                {(activeTheme) => (
                                    <MarketData
                                        colorTheme={activeTheme}
                                        width="100%"
                                        height="100%"
                                        locale="es"
                                        isTransparent={true}
                                        showSymbolLogo={false}
                                        symbolsGroups={[
                                            {
                                                name: 'Índices y Commodities',
                                                originalName: 'Indices',
                                                symbols: [
                                                    { name: 'AMEX:SPY', displayName: 'S&P 500 (SPY)' },
                                                    { name: 'NASDAQ:QQQ', displayName: 'Nasdaq 100 (QQQ)' },
                                                    { name: 'BMFBOVESPA:IBOV', displayName: 'Bovespa Brasil' },
                                                    { name: 'CAPITALCOM:SOYBEAN', displayName: 'Soja Chicago' },
                                                    { name: 'TVC:USOIL', displayName: 'Petróleo WTI' },
                                                    { name: 'OANDA:XAUUSD', displayName: 'Oro (USD/oz)' },
                                                ],
                                            },
                                        ]}
                                    />
                                )}
                            </TradingViewContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* Noticias */}
            <NewsFeed initialNews={initialNews} />
        </main>
    );
}
