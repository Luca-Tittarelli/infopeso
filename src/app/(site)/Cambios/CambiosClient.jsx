'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { cotizacionesAPI } from "@/apis";
import { Loading } from "@/components/LoadingAnim";
import { ChangesCard } from "@/components/cards/CambiosInfoCard";
import { fetchData } from "@/utils/Fetch";
import { ErrorComponent } from "@/components/Error";
import { filtrarUltimoMes } from "@/utils/functions";
import { useDolar } from "@/hooks/useDolar";

const MONEDA_PATHS = { EUR: 'euro', BRL: 'real' };
const CASA_PATHS = { bolsa: 'dolar-mep', contadoconliqui: 'dolar-ccl' };

export default function CambiosClient({ initialDolar, initialOthers, initialCotizaciones }) {
    const { dolar, dolarStatus, cotizaciones, cotizacionesStatus } = useDolar({ dolar: initialDolar, cotizaciones: initialCotizaciones });
    const [others, setOthers] = useState(initialOthers);
    const [othersStatus, setOthersStatus] = useState(initialOthers ? 'success' : 'loading');

    const filtrarPorCasa = (data, casa) =>
        data ? data.filter(c => c.casa === casa) : [];

    useEffect(() => {
        if (initialOthers) return;
        const fetching = async () => {
            const res = await fetchData(cotizacionesAPI);
            setOthers(res.data);
            setOthersStatus(res.status);
        };
        fetching();
    }, [initialOthers]);

    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            {/* Encabezado */}
            <header
                style={{
                    borderBottom: '1px solid var(--line)',
                    padding: 'var(--space-8) 0',
                }}
            >
                <div className="pulso-container">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <p className="label" style={{ color: 'var(--signal-text)', margin: '0 0 var(--space-2) 0' }}>
                                DolarAPI · ArgentinaDatos
                            </p>
                            <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                                Tipos de cambio
                            </h1>
                            <p className="body" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                                Precios de compra y venta actualizados al día de hoy en el mercado argentino.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link href="/Cambios/calculadora-pesos-a-dolar-blue" className="pulso-btn pulso-btn--primary">
                                Calcular pesos a dólar blue
                            </Link>
                            <Link href="/Cambios/calculadora-dolar-tarjeta" className="pulso-btn pulso-btn--secondary">
                                Calcular dólar tarjeta
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <section style={{ padding: 'var(--space-8) 0' }}>
                <div className="pulso-container">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                            Dólar
                        </h2>
                        <div className="flex-1" style={{ height: '1px', background: 'var(--line)' }} />
                    </div>

                    {dolarStatus === 'loading' && <Loading />}
                    {dolarStatus === 'error' && <ErrorComponent message="Error al obtener datos del dólar" />}
                    {dolarStatus === 'success' && dolar && (
                        <div
                            className="grid"
                            style={{
                                gap: 'var(--space-4)',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            }}
                        >
                            {dolar.map((item, key) => {
                                const pathId = CASA_PATHS[item.casa] || `dolar-${item.casa}`;
                                return (
                                    <ChangesCard
                                        key={key}
                                        titulo={item.nombre}
                                        compra={item.compra}
                                        venta={item.venta}
                                        fecha={item.fechaActualizacion}
                                        chart={{ type: 'line', duration: 'month' }}
                                        linkTo={`/Cambios/${pathId}`}
                                        cotizaciones={{
                                            status: cotizacionesStatus,
                                            data: filtrarPorCasa(
                                                filtrarUltimoMes(cotizaciones || []),
                                                item.casa
                                            ),
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}

                    <div className="flex items-center gap-3 mt-10 mb-4">
                        <h2 className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                            Otras monedas
                        </h2>
                        <div className="flex-1" style={{ height: '1px', background: 'var(--line)' }} />
                    </div>

                    {othersStatus === 'loading' && <Loading />}
                    {othersStatus === 'error' && <ErrorComponent message="Error al obtener cotizaciones" />}
                    {othersStatus === 'success' && others && (
                        <>
                            <div
                                className="grid"
                                style={{
                                    gap: 'var(--space-4)',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                }}
                            >
                                {others.map((item, key) => (
                                    <ChangesCard
                                        key={key}
                                        titulo={item.nombre}
                                        compra={item.compra}
                                        venta={item.venta}
                                        fecha={item.fechaActualizacion}
                                        chart={false}
                                        linkTo={MONEDA_PATHS[item.moneda] ? `/Cambios/${MONEDA_PATHS[item.moneda]}` : undefined}
                                    />
                                ))}
                            </div>
                            <p className="body-sm" style={{ color: 'var(--ink-subtle)', textAlign: 'center', marginTop: 'var(--space-8)' }}>
                                Fuente:{' '}
                                <a href="https://dolarapi.com" className="hover:underline" style={{ color: 'var(--signal-text)' }} target="_blank" rel="noopener noreferrer">DolarAPI</a>
                            </p>

                            <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--line)' }}>
                                <h2 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-6)' }}>
                                    Preguntas frecuentes sobre el dólar y tipos de cambio
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                                    <div className="pulso-card">
                                        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', fontWeight: 700, color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                                            ¿Qué es el dólar blue y cómo se determina su valor?
                                        </h3>
                                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                            El dólar blue es el tipo de cambio informal que se comercializa de forma libre en el mercado paralelo de Argentina. Su cotización no está regulada por el Banco Central (BCRA) y su valor fluctúa según la oferta y demanda de divisas en efectivo.
                                        </p>
                                    </div>
                                    <div className="pulso-card">
                                        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', fontWeight: 700, color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                                            ¿Cuál es la diferencia entre el dólar MEP y el dólar CCL?
                                        </h3>
                                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                            Ambos son dólares financieros legales que se operan comprando y vendiendo bonos o acciones en la bolsa. El dólar MEP (Mercado Electrónico de Pagos) se liquida en cuentas bancarias locales, mientras que el dólar CCL (Contado con Liquidación) permite girar divisas a cuentas del exterior.
                                        </p>
                                    </div>
                                    <div className="pulso-card">
                                        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', fontWeight: 700, color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                                            ¿Cómo se calcula el dólar tarjeta o turista?
                                        </h3>
                                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                            El dólar tarjeta se calcula tomando como base la cotización oficial minorista del Banco Nación y sumándole la percepción a cuenta de Ganancias o Bienes Personales (actualmente 30 % sobre el oficial). El Impuesto PAIS dejó de aplicarse en diciembre de 2024.
                                        </p>
                                    </div>
                                    <div className="pulso-card">
                                        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', fontWeight: 700, color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                                            ¿Qué es el dólar oficial minorista?
                                        </h3>
                                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                            Es el valor de referencia de venta al público en bancos y entidades reguladas por el BCRA, y sirve de base imponible para el cálculo del dólar tarjeta.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
