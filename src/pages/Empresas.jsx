import React, { useState, useEffect } from 'react';
import { useFundamentals } from '../hooks/useFundamentals';
import { CompanyFundamentalsCard } from '../components/cards/CompanyFundamentalsCard';
import { useTheme } from '../hooks/useTheme';

const CATEGORIES = [
    {
        name: 'Argentina',
        companies: [
            { symbol: 'GGAL.BA',  name: 'Galicia' },
            { symbol: 'YPFD.BA',  name: 'YPF' },
            { symbol: 'PAMP.BA',  name: 'Pampa Energía' },
            { symbol: 'BMA.BA',   name: 'Banco Macro' },
            { symbol: 'BBAR.BA',  name: 'BBVA' },
            { symbol: 'CEPU.BA',  name: 'Central Puerto' },
            { symbol: 'LOMA.BA',  name: 'Loma Negra' },
            { symbol: 'CRES.BA',  name: 'Cresud' },
            { symbol: 'IRSA.BA',  name: 'IRSA' },
            { symbol: 'TGSU2.BA', name: 'TGS' },
            { symbol: 'ALUA.BA',  name: 'Aluar' },
            { symbol: 'TXAR.BA',  name: 'Ternium' },
        ]
    },
    {
        name: 'Internacional',
        companies: [
            { symbol: 'MELI',     name: 'Mercado Libre' },
            { symbol: 'AAPL',     name: 'Apple' },
            { symbol: 'MSFT',     name: 'Microsoft' },
            { symbol: 'NVDA',     name: 'NVIDIA' },
            { symbol: 'TSLA',     name: 'Tesla' },
            { symbol: 'AMZN',     name: 'Amazon' },
            { symbol: 'GOOGL',    name: 'Alphabet' },
            { symbol: 'META',     name: 'Meta' },
            { symbol: 'TSM',      name: 'TSMC' },
            { symbol: 'KO',       name: 'Coca-Cola' },
            { symbol: 'WMT',      name: 'Walmart' },
            { symbol: 'NU',       name: 'Nubank' },
            { symbol: 'BRK-B',    name: 'Berkshire' },
            { symbol: 'NFLX',     name: 'Netflix' },
        ]
    }
];

export default function Empresas() {
    const [theme] = useTheme();
    const [selectedSymbol, setSelectedSymbol] = useState(CATEGORIES[0].companies[0].symbol);
    
    const { data, status } = useFundamentals(selectedSymbol);

    useEffect(() => {
        if (selectedSymbol) {
            localStorage.setItem('lastViewedCompany', selectedSymbol);
        }
    }, [selectedSymbol]);

    useEffect(() => {
        document.title = 'Infopeso — Fundamentos de Empresa';
        document.querySelector('meta[name="description"]')?.setAttribute('content',
            'Análisis fundamental de empresas argentinas e internacionales. Ratios, balances y perfiles corporativos.'
        );
    }, []);

    return (
        <main className="min-h-screen pt-14 pb-16 md:pb-12">
            <div className="px-5 sm:px-8 py-8 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="max-w-[1200px] mx-auto">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1"
                       style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}>
                        Análisis Fundamental
                    </p>
                    <h1 className="text-3xl sm:text-4xl leading-tight"
                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                        Empresas y Ratios
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
                        Métricas clave para inversores de valor y análisis corporativo.
                    </p>
                </div>
            </div>

            <section className="px-5 sm:px-8 py-8">
                <div className="max-w-[1200px] mx-auto space-y-10">
                    
                    {/* Selector por Categorías */}
                    <div className="space-y-6">
                        {CATEGORIES.map((category) => (
                            <div key={category.name} className="space-y-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>
                                    {category.name}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {category.companies.map((company) => (
                                        <button
                                            key={company.symbol}
                                            onClick={() => setSelectedSymbol(company.symbol)}
                                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                                                selectedSymbol === company.symbol 
                                                ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]' 
                                                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                                            }`}
                                        >
                                            {company.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Fundamentals Card */}
                        <div className="lg:col-span-8">
                            <CompanyFundamentalsCard data={data} status={status} />
                        </div>

                        {/* Side Stats / Info */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                                <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Análisis de {data?.assetProfile?.longName}</h4>
                                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                                    Esta empresa pertenece al sector de <strong>{data?.assetProfile?.sector}</strong>. 
                                    Su capitalización de mercado de <strong>{data?.summaryDetail?.marketCap?.fmt}</strong> la posiciona como un jugador relevante en su industria.
                                </p>
                            </div>
                            
                            <div className="p-5 rounded-2xl" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>Sugerencia de Inversión</p>
                                <p className="text-[11px]" style={{ color: 'var(--text-primary)' }}>
                                    Compara el <strong>P/E Ratio</strong> con el promedio de su sector para determinar si la acción está sobrevaluada o subvaluada.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dictionary Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>ROE (Return on Equity)</h3>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                                Mide la rentabilidad de la empresa en relación con el patrimonio neto. Indica qué tan eficiente es la gerencia para generar ganancias con el dinero de los accionistas.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Beta (5Y Monthly)</h3>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                                Indica la volatilidad de la acción frente al mercado. Un beta mayor a 1 significa que la acción es más volátil que el promedio.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Profit Margin</h3>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                                El porcentaje de ingresos que se convierte en ganancia neta después de todos los gastos. Es vital para medir la eficiencia operativa.
                            </p>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[10px] text-center pt-8 opacity-50" style={{ color: 'var(--text-tertiary)' }}>
                        Datos obtenidos de registros públicos y consolidados localmente. 
                        Debido a restricciones técnicas en tiempo real, los fundamentos se actualizan de forma periódica.
                        Infopeso no brinda asesoría financiera.
                    </p>
                </div>
            </section>
        </main>
    );
}
