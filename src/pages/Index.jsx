import { useEffect, useState } from "react";
import { filtrarUltimoMes, getDatesRange, getYesterdayDate } from "../utils/functions";
import { fetchData } from "../utils/Fetch";
import { dolarFechaAPI, variableAPI, RiesgoPaisHistoricoAPI } from "../apis";
import { ErrorComponent } from "../components/Error";
import { indexCategories } from "../MacroFilters";
import { LoadingCard } from "../components/LoadingCard";
import { useDolar } from "../hooks/useDolar";
import { useMacro } from "../hooks/useMacro";
import { Link } from "react-router-dom";
import { DenseRowItem } from "../components/cards/DenseRowItem";
import { MiniChart } from "react-ts-tradingview-widgets";
import { useTheme } from "../hooks/useTheme";
import { NewsFeed } from "../components/news/NewsFeed";

// Bento Grid - Hero Metric Component
function BentoHeroMetric({ valor, label, diff }) {
    const isPositive = diff > 0;
    const isNegative = diff < 0;
    const diffColor = isPositive ? 'var(--positive)' : isNegative ? 'var(--negative)' : 'var(--text-tertiary)';
    return (
        <div className="flex flex-col gap-1 p-4 rounded-xl h-full justify-center transition-transform active:scale-[0.98]" 
             style={{ 
                 background: 'var(--bg-surface)', 
                 border: '1px solid var(--border-subtle)',
             }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>
                Dólar Blue · Principal
            </p>
            <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}>
                    {valor !== null ? `$${Number(valor).toLocaleString('es-AR')}` : '—'}
                </span>
                {diff !== null && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded tabular-nums" style={{
                        background: isPositive ? 'var(--positive-soft)' : isNegative ? 'var(--negative-soft)' : 'var(--bg-surface-hover)',
                        color: diffColor,
                    }}>
                        {isPositive ? '+' : ''}{diff.toFixed(2)}% hoy
                    </span>
                )}
            </div>
            <p className="text-[10px] mt-auto pt-1" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        </div>
    );
}

// Bento Grid - Macro Pill
function MacroPill({ titulo, valor, diff, isPercent, isPuntosBasicos }) {
    return (
        <div className="flex flex-col p-2.5 rounded-xl transition-transform active:scale-[0.98]" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <span className="text-[10px] font-medium mb-1 leading-tight" style={{ color: 'var(--text-secondary)' }}>{titulo}</span>
            <span className="text-base font-bold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}>
                {valor !== undefined ? `${Number(valor).toLocaleString('es-AR')}${isPercent ? '%' : isPuntosBasicos ? ' pb' : ''}` : '—'}
            </span>
        </div>
    );
}

export default function Index() {
    const [theme] = useTheme();
    const [lastMacro, setLastMacro] = useState([]);
    const [lastDolar, setLastDolar] = useState([]);
    const { dolar, dolarStatus } = useDolar();
    const { variables, variablesStatus } = useMacro();

    const filter = (categorie, object) => object?.filter(item => categorie.includes(item.idVariable)) || [];

    // Find Dólar Blue for hero
    const dolarBlue = dolar?.find(d => d.casa === 'blue');
    const lastBlue = lastDolar.find(d => d.casa === 'blue');
    const blueDiff = dolarBlue && lastBlue ? ((dolarBlue.venta - lastBlue.venta) / lastBlue.venta) * 100 : null;

    const handleFetchDolar = async (casa) => {
        const res = await fetchData(dolarFechaAPI(casa, getYesterdayDate().replace(/-/g, '/')));
        setLastDolar(prev => [...prev, res.data]);
    };

    const handleFetchMacro = async (id) => {
        if (id === 'riesgo-pais') {
            const res = await fetchData(RiesgoPaisHistoricoAPI);
            const rp = filtrarUltimoMes(res.data)[0];
            setLastMacro(prev => [...prev, { idVariable: 'riesgo-pais', fecha: rp?.fecha, valor: rp?.valor }]);
        } else {
            const dates = getDatesRange();
            const res = await fetchData(variableAPI(id, dates[0], dates[1]));
            const resultObj = res.data.results?.length > 0 ? res.data.results[0] : null;
            if (resultObj?.detalle?.length > 0) {
                setLastMacro(prev => [...prev, {
                    idVariable: resultObj.idVariable,
                    fecha: resultObj.detalle[0].fecha,
                    valor: resultObj.detalle[0].valor,
                }]);
            }
        }
    };

    useEffect(() => {
        if (variablesStatus === 'success') {
            filter(indexCategories, variables).forEach(i => handleFetchMacro(i.idVariable));
        }
    }, [variables, variablesStatus]);

    useEffect(() => {
        if (dolarStatus === 'success') {
            dolar.forEach(item => handleFetchDolar(item.casa));
        }
    }, [dolar, dolarStatus]);

    useEffect(() => {
        document.title = 'Infopeso — Dashboard Financiero';
        document.querySelector('meta[name="description"]')?.setAttribute('content',
            'Dashboard financiero argentino de alta densidad. Cotizaciones del dólar, inflación, riesgo país y BCRA.'
        );
    }, []);

    const isLoading = dolarStatus === 'loading' || variablesStatus === 'loading';
    const hasError = dolarStatus === 'error' || variablesStatus === 'error';

    return (
        <main className="min-h-screen pt-16 pb-12 flex flex-col">
            
            {/* ── Hero Headline ─────────────────────────────────────────────── */}
            <section className="w-full px-5 sm:px-8 py-3 sm:py-5 shrink-0">
                <div className="max-w-[1400px] mx-auto">
                    <p
                        className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                        style={{ color: 'var(--accent)', fontFamily: 'General Sans, system-ui' }}
                    >
                        Economía Argentina
                    </p>
                    <h1
                        className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
                        style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}
                    >
                        Datos financieros <span style={{ color: 'var(--accent)' }}>en tiempo real.</span>
                    </h1>
                </div>
            </section>

            {/* ── Framed Dashboard Container ────────────────────────────────────── */}
            <section className="px-3 sm:px-6 shrink-0">
                <div 
                    className="max-w-[1400px] mx-auto p-3 sm:p-4 rounded-[20px] shadow-sm flex flex-col gap-4"
                    style={{ 
                        background: 'var(--bg-surface)', 
                        border: '1px solid var(--border-subtle)',
                    }}
                >
                    {/* Internal Header */}
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--positive)' }}></div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--accent)', fontFamily: 'General Sans, system-ui' }}>
                                    Live Terminal
                                </p>
                            </div>
                            <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}>
                                Dashboard Económico
                            </h1>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Argentina, {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        </div>
                    </div>

                    {hasError && <div className="mb-2"><ErrorComponent message="Error al cargar el dashboard" /></div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-4">
                        
                        {/* ── Izquierda: Tipos de Cambio (Dense List) ── */}
                        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-2">
                            <h2 className="text-[9px] font-semibold uppercase tracking-[0.1em] px-1" style={{ color: 'var(--text-tertiary)' }}>Tipos de Cambio</h2>
                            <div className="rounded-xl overflow-hidden flex-1 flex flex-col" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                                {isLoading ? (
                                    <div className="p-2 space-y-2">
                                        {[1,2,3,4,5,6].map(i => <LoadingCard key={i} />)}
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full">
                                        <div className="flex-1">
                                            {dolar?.filter(item => item.casa !== 'blue' && item.casa !== 'mayorista').map((item, i) => {
                                                const lastValue = lastDolar.find(d => d.casa === item.casa)?.venta;
                                                return (
                                                    <DenseRowItem 
                                                        key={i} 
                                                        titulo={item.nombre} 
                                                        valor={item.venta} 
                                                        valorAnterior={lastValue} 
                                                        linkTo="/Cambios"
                                                    />
                                                );
                                            })}
                                        </div>
                                        <Link to="/Cambios" className="block text-center text-[9px] py-2 font-semibold uppercase tracking-wider hover:underline border-t mt-auto" style={{ color: 'var(--accent)', background: 'var(--bg-surface-hover)', borderColor: 'var(--border-subtle)' }}>
                                            Ver tabla completa →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Centro: Hero Blue & Chart ─────────────── */}
                        <div className="md:col-span-8 lg:col-span-6 flex flex-col gap-3">
                            <h2 className="text-[9px] font-semibold uppercase tracking-[0.1em] px-1 opacity-0 hidden md:block">Principal</h2>
                            
                            {/* Blue Bento Box */}
                            <div className="h-[100px] sm:h-[120px]">
                                {isLoading ? <LoadingCard /> : <BentoHeroMetric valor={dolarBlue?.venta} label="Venta Libre (Mercado Paralelo)" diff={blueDiff} />}
                            </div>

                            {/* Mini Chart Merval */}
                            <div className="flex-1 min-h-[140px] rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                                <MiniChart 
                                    colorTheme={theme} 
                                    width="100%" 
                                    height="100%" 
                                    symbol="BCBA:IMV" 
                                    locale="es"
                                    isTransparent={true}
                                />
                            </div>
                        </div>

                        {/* ── Derecha: Macro Pills ─────────────────── */}
                        <div className="md:col-span-12 lg:col-span-3 flex flex-col gap-2">
                            <h2 className="text-[9px] font-semibold uppercase tracking-[0.1em] px-1" style={{ color: 'var(--text-tertiary)' }}>Datos Inversores</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 flex-1">
                                {isLoading ? (
                                    <>
                                        {[1,2,3,4].map(i => <div key={i} className="h-16"><LoadingCard /></div>)}
                                    </>
                                ) : (
                                    filter(indexCategories, variables).slice(0, 5).map((element, index) => {
                                        const isPercent = element.idVariable === 27 || element.idVariable === 6;
                                        const isPuntosBasicos = element.idVariable === 'riesgo-pais';
                                        return (
                                            <MacroPill
                                                key={index}
                                                titulo={element.descripcion.split('(')[0].trim()}
                                                valor={element.valor}
                                                isPercent={isPercent}
                                                isPuntosBasicos={isPuntosBasicos}
                                            />
                                        );
                                    })
                                )}
                            </div>
                            <Link to="/Economia" className="block text-center text-[9px] py-2 rounded-lg font-semibold uppercase tracking-wider transition-colors" style={{ color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-hover)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--border-subtle)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}>
                                Explorar Macro →
                            </Link>
                        </div>

                    </div>

                    {/* ── Bottom Row: Commodities Strip ───────────── */}
                    <div className="pt-1">
                        <h2 className="text-[9px] font-semibold uppercase tracking-[0.1em] mb-2 px-1" style={{ color: 'var(--text-tertiary)' }}>
                            Commodities Clave
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="rounded-xl overflow-hidden pointer-events-none" style={{ border: '1px solid var(--border-subtle)', height: '110px' }}>
                                <MiniChart colorTheme={theme} width="100%" height="100%" symbol="CAPITALCOM:SOYBEAN" locale="es" isTransparent={true} />
                            </div>
                            <div className="rounded-xl overflow-hidden pointer-events-none" style={{ border: '1px solid var(--border-subtle)', height: '110px' }}>
                                <MiniChart colorTheme={theme} width="100%" height="100%" symbol="CAPITALCOM:CORN" locale="es" isTransparent={true} />
                            </div>
                            <div className="rounded-xl overflow-hidden pointer-events-none" style={{ border: '1px solid var(--border-subtle)', height: '110px' }}>
                                <MiniChart colorTheme={theme} width="100%" height="100%" symbol="TVC:USOIL" locale="es" isTransparent={true} />
                            </div>
                            <div className="rounded-xl overflow-hidden pointer-events-none" style={{ border: '1px solid var(--border-subtle)', height: '110px' }}>
                                <MiniChart colorTheme={theme} width="100%" height="100%" symbol="OANDA:XAUUSD" locale="es" isTransparent={true} />
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── News Feed (Outside the frame) ─────────────────────────────────── */}
            <div className="mt-6 flex-1">
                <NewsFeed />
            </div>
        </main>
    );
}
