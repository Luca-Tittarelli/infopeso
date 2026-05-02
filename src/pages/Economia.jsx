import { useEffect, useState } from 'react';
import { MacroCard } from '../components/cards/MacroInfoCard';
import { Loading } from '../components/LoadingAnim';
import { ErrorComponent } from '../components/Error';
import { categories } from '../MacroFilters';
import { useMacro } from '../hooks/useMacro';

const TABS = [
    { key: 'bcra',               label: 'BCRA',              chart: { type: 'line', duration: 'month' } },
    { key: 'baseMonetaria',      label: 'Base Monetaria',    chart: { type: 'line', duration: 'month' } },
    { key: 'inflacion',          label: 'Inflación',         chart: { type: 'bars', duration: 'year'  } },
    { key: 'tasas',              label: 'Tasas',             chart: { type: 'line', duration: 'month' } },
    { key: 'prestamos',          label: 'Préstamos',         chart: { type: 'line', duration: 'month' } },
    { key: 'unidadesFinancieras',label: 'UVA / UVI',        chart: { type: 'line', duration: 'month' } },
    { key: 'otrosIndices',       label: 'Otros índices',     chart: { type: 'line', duration: 'month' } },
];

export default function Economia() {
    const { variables, variablesStatus } = useMacro();
    const [activeTab, setActiveTab] = useState('bcra');
    const [showOthers, setShowOthers] = useState(false);

    const filter = (categorie) =>
        variables?.filter(item => categorie.includes(item.idVariable)) || [];

    const allCategories = Object.values(categories).flat();
    const notIncludes = variables?.filter(item => !allCategories.includes(item.idVariable)) || [];

    const currentTab = TABS.find(t => t.key === activeTab);
    const currentData = filter(categories[activeTab] || []);

    useEffect(() => {
        document.title = `Infopeso — Variables al ${new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`;
        document.querySelector('meta[name="description"]')?.setAttribute('content',
            'Indicadores clave de la economía argentina: inflación, tasas de interés, reservas, riesgo país y más. Actualizado diariamente.'
        );
    }, []);

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
                        BCRA · ArgentinaDatos
                    </p>
                    <h1
                        className="text-3xl sm:text-4xl font-bold tracking-tight"
                        style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}
                    >
                        Variables de la economía
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Datos actualizados al {new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* ── Tab bar ─────────────────────────────────────── */}
            <div
                className="sticky top-16 z-30 px-5 sm:px-8 py-3 overflow-x-auto"
                style={{
                    background: 'var(--header-bg)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border-subtle)',
                }}
            >
                <div className="max-w-[1200px] mx-auto flex items-center gap-2 min-w-max">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={activeTab === tab.key ? 'pill-active' : 'pill-inactive'}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <div className="w-px h-5 mx-1" style={{ background: 'var(--border-subtle)' }} />
                    <button
                        onClick={() => setActiveTab('otros')}
                        className={activeTab === 'otros' ? 'pill-active' : 'pill-inactive'}
                    >
                        Otros ({notIncludes.length})
                    </button>
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────── */}
            <section className="px-5 sm:px-8 py-8">
                <div className="max-w-[1200px] mx-auto">

                    {variablesStatus === 'loading' && <Loading />}
                    {variablesStatus === 'error' && <ErrorComponent message="Error al obtener los datos del BCRA" />}

                    {variablesStatus === 'success' && (
                        <>
                            {activeTab !== 'otros' ? (
                                <>
                                    {currentData.length === 0 ? (
                                        <p className="text-sm text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
                                            Sin datos disponibles para esta categoría.
                                        </p>
                                    ) : (
                                        <div
                                            className="grid gap-4"
                                            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
                                        >
                                            {currentData.map((element, index) => (
                                                <div
                                                    key={index}
                                                    className="stagger-item"
                                                    style={{ animationDelay: `${index * 60}ms` }}
                                                >
                                                    <MacroCard
                                                        titulo={element.descripcion.split('(')[0].trim()}
                                                        valor={element.valor}
                                                        desc={element.descripcion.split('(')[1]?.replace(/[()]/g, '')}
                                                        fecha={element.fecha}
                                                        id={element.idVariable}
                                                        chart={currentTab?.chart || { type: 'line', duration: 'month' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* "Otros" tab */
                                <div
                                    className="grid gap-4"
                                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
                                >
                                    {notIncludes.map((element, index) => (
                                        <div
                                            key={`otros-${index}`}
                                            className="stagger-item"
                                            style={{ animationDelay: `${index * 40}ms` }}
                                        >
                                            <MacroCard
                                                titulo={element.descripcion.split('(')[0].trim()}
                                                valor={element.valor}
                                                desc={element.descripcion.split('(')[1]?.replace(/[()]/g, '')}
                                                fecha={element.fecha}
                                                id={element.idVariable}
                                                chart={{ type: 'line', duration: 'month' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Source attribution */}
                            <p className="text-xs text-center mt-10" style={{ color: 'var(--text-tertiary)' }}>
                                Fuente:{' '}
                                <a href="https://bcra.gob.ar/Catalogo/apis.asp" className="hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">BCRA</a>
                                {' '}·{' '}
                                <a href="https://argentinadatos.com/" className="hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">ArgentinaDatos API</a>
                            </p>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
