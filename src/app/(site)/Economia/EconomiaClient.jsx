'use client';

import { useState, useEffect } from 'react';
import { MacroListRow } from '@/components/cards/MacroListRow';
import { Loading } from '@/components/LoadingAnim';
import { ErrorComponent } from '@/components/Error';
import { categories } from '@/MacroFilters';
import { useMacro } from '@/hooks/useMacro';
import { usePBI } from '@/hooks/usePBI';

const TABS = [
    { key: 'pbi',                 label: 'PBI',               chart: { type: 'line', duration: 'year' } },
    { key: 'bcra',                label: 'BCRA',              chart: { type: 'line', duration: 'month' } },
    { key: 'baseMonetaria',       label: 'Base monetaria',    chart: { type: 'line', duration: 'month' } },
    { key: 'inflacion',           label: 'Inflación',         chart: { type: 'bars', duration: 'year'  } },
    { key: 'tasas',               label: 'Tasas',             chart: { type: 'line', duration: 'month' } },
    { key: 'prestamos',           label: 'Préstamos',         chart: { type: 'line', duration: 'month' } },
    { key: 'unidadesFinancieras', label: 'UVA / UVI',         chart: { type: 'line', duration: 'month' } },
    { key: 'otrosIndices',        label: 'Otros índices',     chart: { type: 'line', duration: 'month' } },
];

const macroBatchCache = {};

export default function EconomiaClient({ initialVariables, initialPBI }) {
    const { variables, variablesStatus } = useMacro(initialVariables);
    const { pbiData, pbiStatus } = usePBI(initialPBI);
    const [activeTab, setActiveTab] = useState('pbi');
    const [batchHistory, setBatchHistory] = useState(macroBatchCache);

    const filter = (categorie) =>
        variables?.filter(item => categorie.includes(item.idVariable)) || [];

    const allCategories = Object.values(categories).flat();
    const notIncludes = variables?.filter(item => !allCategories.includes(item.idVariable)) || [];

    const currentTab = TABS.find(t => t.key === activeTab);
    const currentData = filter(categories[activeTab] || []);

    useEffect(() => {
        if (activeTab === 'pbi') return;

        const targetItems = activeTab === 'otros' ? notIncludes : currentData;
        const targetIds = targetItems.map(item => item.idVariable);
        if (targetIds.length === 0) return;

        const missingIds = targetIds.filter(id => !macroBatchCache[id]);
        if (missingIds.length === 0) {
            setBatchHistory(prev => ({ ...prev, ...macroBatchCache }));
            return;
        }

        const duration = currentTab?.chart?.duration || 'month';
        const fetchBatch = async () => {
            try {
                const res = await fetch(`/api/macro-history?ids=${missingIds.join(',')}&duration=${duration}`);
                if (res.ok) {
                    const data = await res.json();
                    Object.assign(macroBatchCache, data);
                    setBatchHistory(prev => ({ ...prev, ...data }));
                }
            } catch (err) {
                console.error("Error fetching batch macro history:", err);
            }
        };

        fetchBatch();
    }, [activeTab, variables]);

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
                        BCRA · ArgentinaDatos · Banco Mundial
                    </p>
                    <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                        Indicadores macroeconómicos
                    </h1>
                    <p className="body" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                        Variables monetarias, reservas, inflación y actividad económica de Argentina.
                    </p>
                </div>
            </header>

            <div
                className="sticky top-14 z-30 overflow-x-auto"
                style={{
                    background: 'var(--ground-000)',
                    borderBottom: '1px solid var(--line)',
                    padding: 'var(--space-3) 0',
                }}
            >
                <div className="pulso-container flex items-center gap-2 min-w-max">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={activeTab === tab.key ? 'pill-active' : 'pill-inactive'}
                            style={{ cursor: 'pointer' }}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <div style={{ width: '1px', height: '20px', background: 'var(--line)', margin: '0 var(--space-1)' }} />
                    <button
                        type="button"
                        onClick={() => setActiveTab('otros')}
                        className={activeTab === 'otros' ? 'pill-active' : 'pill-inactive'}
                        style={{ cursor: 'pointer' }}
                    >
                        Otros ({notIncludes.length})
                    </button>
                </div>
            </div>

            <section style={{ padding: 'var(--space-8) 0' }}>
                <div className="pulso-container">
                    {activeTab !== 'pbi' && variablesStatus === 'loading' && <Loading />}
                    {activeTab !== 'pbi' && variablesStatus === 'error' && <ErrorComponent message="Error al obtener los datos del BCRA" />}
                    
                    {activeTab === 'pbi' && pbiStatus === 'loading' && <Loading />}
                    {activeTab === 'pbi' && pbiStatus === 'error' && <ErrorComponent message="Error al obtener los datos del Banco Mundial" />}

                    {activeTab === 'pbi' && pbiStatus === 'success' && (
                        <div>
                            {pbiData.length === 0 ? (
                                <p className="body-sm text-center py-12" style={{ color: 'var(--ink-subtle)' }}>
                                    Sin datos disponibles de PBI.
                                </p>
                            ) : (
                                <div
                                    style={{
                                        background: 'var(--surface-100)',
                                        border: '1px solid var(--line)',
                                        borderRadius: 'var(--radius-md)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {pbiData.map((element, index) => (
                                        <MacroListRow
                                            key={index}
                                            titulo={element.descripcion.split('(')[0].trim()}
                                            valor={element.valor}
                                            desc={element.descripcion.split('(')[1]?.replace(/[()]/g, '')}
                                            fecha={element.fecha}
                                            id={element.idVariable}
                                            chart={{ type: 'line', duration: 'year' }}
                                            historyData={element.history}
                                            rawDiff={element.difference}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab !== 'pbi' && variablesStatus === 'success' && (
                        <>
                            {activeTab !== 'otros' ? (
                                <>
                                    {currentData.length === 0 ? (
                                        <p className="body-sm text-center py-12" style={{ color: 'var(--ink-subtle)' }}>
                                            Sin datos disponibles para esta categoría.
                                        </p>
                                    ) : (
                                        <div
                                            style={{
                                                background: 'var(--surface-100)',
                                                border: '1px solid var(--line)',
                                                borderRadius: 'var(--radius-md)',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {currentData.map((element, index) => (
                                                <MacroListRow
                                                    key={index}
                                                    titulo={element.descripcion.split('(')[0].trim()}
                                                    valor={element.valor}
                                                    desc={element.descripcion.split('(')[1]?.replace(/[()]/g, '')}
                                                    fecha={element.fecha}
                                                    id={element.idVariable}
                                                    chart={currentTab?.chart || { type: 'line', duration: 'month' }}
                                                    historyData={batchHistory[element.idVariable]?.history}
                                                    rawDiff={batchHistory[element.idVariable]?.difference}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div
                                    style={{
                                        background: 'var(--surface-100)',
                                        border: '1px solid var(--line)',
                                        borderRadius: 'var(--radius-md)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {notIncludes.map((element, index) => (
                                        <MacroListRow
                                            key={`otros-${index}`}
                                            titulo={element.descripcion.split('(')[0].trim()}
                                            valor={element.valor}
                                            desc={element.descripcion.split('(')[1]?.replace(/[()]/g, '')}
                                            fecha={element.fecha}
                                            id={element.idVariable}
                                            chart={{ type: 'line', duration: 'month' }}
                                            historyData={batchHistory[element.idVariable]?.history}
                                            rawDiff={batchHistory[element.idVariable]?.difference}
                                        />
                                    ))}
                                </div>
                            )}

                            <p className="body-sm" style={{ color: 'var(--ink-subtle)', textAlign: 'center', marginTop: 'var(--space-8)' }}>
                                Fuente:{' '}
                                {activeTab === 'pbi' ? (
                                    <a href="https://data.worldbank.org/" className="hover:underline" style={{ color: 'var(--signal-text)' }} target="_blank" rel="noopener noreferrer">Banco Mundial</a>
                                ) : (
                                    <>
                                        <a href="https://bcra.gob.ar/Catalogo/apis.asp" className="hover:underline" style={{ color: 'var(--signal-text)' }} target="_blank" rel="noopener noreferrer">BCRA</a>
                                        {' '}·{' '}
                                        <a href="https://argentinadatos.com/" className="hover:underline" style={{ color: 'var(--signal-text)' }} target="_blank" rel="noopener noreferrer">ArgentinaDatos API</a>
                                    </>
                                )}
                            </p>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
