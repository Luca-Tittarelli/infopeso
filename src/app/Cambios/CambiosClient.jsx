'use client';

import { useState, useEffect } from "react";
import { cotizacionesAPI } from "@/apis";
import { Loading } from "@/components/LoadingAnim";
import { ChangesCard } from "@/components/cards/CambiosInfoCard";
import { fetchData } from "@/utils/Fetch";
import { ErrorComponent } from "@/components/Error";
import { filtrarUltimoMes } from "@/utils/functions";
import { useDolar } from "@/hooks/useDolar";

export default function CambiosClient({ initialDolar, initialOthers, initialCotizaciones }) {
    const { dolar, dolarStatus, cotizaciones, cotizacionesStatus } = useDolar({ dolar: initialDolar, cotizaciones: initialCotizaciones });
    const [others, setOthers] = useState(initialOthers);
    const [othersStatus, setOthersStatus] = useState(initialOthers ? 'success' : 'loading');

    const filtrarPorCasa = (data, casa) =>
        data.filter(c => c.casa === casa);

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
        <main className="min-h-screen pt-14 pb-16 md:pb-12">
            <div
                className="px-5 sm:px-8 py-8"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
                <div className="max-w-[1200px] mx-auto">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1"
                       style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}>
                        DolarAPI · ArgentinaDatos
                    </p>
                    <h1 className="text-3xl sm:text-4xl leading-tight"
                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                        Tipos de cambio
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
                        Precios de compra y venta actualizados al día de hoy
                    </p>
                </div>
            </div>

            <section className="px-5 sm:px-8 py-8">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <h2
                            className="text-xs font-semibold uppercase tracking-[0.1em]"
                            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-ui)' }}
                        >
                            Dólar
                        </h2>
                        <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                    </div>

                    {dolarStatus === 'loading' && <Loading />}
                    {dolarStatus === 'error' && <ErrorComponent message="Error al obtener datos del dólar" />}
                    {dolarStatus === 'success' && dolar && (
                        <div
                            className="grid gap-4"
                            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
                        >
                            {dolar
                                .filter(item => item.casa !== 'mayorista')
                                .map((item, key) => {
                                    const pathId = ['blue', 'oficial', 'mep', 'ccl', 'tarjeta'].includes(item.casa)
                                        ? `dolar-${item.casa}`
                                        : item.casa;
                                    return (
                                        <div
                                            key={key}
                                            className="stagger-item"
                                            style={{ animationDelay: `${key * 55}ms` }}
                                        >
                                            <ChangesCard
                                                titulo={item.nombre}
                                                compra={item.compra}
                                                venta={item.venta}
                                                fecha={item.fechaActualizacion}
                                                chart={{ type: 'line', duration: 'month' }}
                                                linkTo={`/Cambios/${pathId}`}
                                                cotizaciones={{
                                                    status: cotizacionesStatus,
                                                    data: filtrarPorCasa(
                                                        filtrarUltimoMes(cotizaciones),
                                                        item.casa
                                                    ),
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                        </div>
                    )}

                    <div className="flex items-center gap-3 mt-10 mb-4">
                        <h2
                            className="text-xs font-semibold uppercase tracking-[0.1em]"
                            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-ui)' }}
                        >
                            Otras monedas
                        </h2>
                        <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                    </div>

                    {othersStatus === 'loading' && <Loading />}
                    {othersStatus === 'error' && <ErrorComponent message="Error al obtener cotizaciones" />}
                    {othersStatus === 'success' && others && (
                        <>
                            <div
                                className="grid gap-4"
                                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
                            >
                                {others.map((item, key) => (
                                    <div
                                        key={key}
                                        className="stagger-item"
                                        style={{ animationDelay: `${key * 40}ms` }}
                                    >
                                        <ChangesCard
                                            titulo={item.nombre}
                                            compra={item.compra.toFixed(1)}
                                            venta={item.venta.toFixed(1)}
                                            fecha={item.fechaActualizacion}
                                            chart={false}
                                            linkTo={`/Cambios/${item.casa}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-center mt-8" style={{ color: 'var(--text-tertiary)' }}>
                                Fuente:{' '}
                                <a href="https://dolarapi.com" className="hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">DolarAPI</a>
                            </p>

                            <div className="mt-16 pt-8 border-t border-[var(--border-subtle)]">
                                <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                                    Preguntas Frecuentes sobre el Dólar y Tipos de Cambio
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                                        <h3 className="text-sm font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                            ¿Qué es el Dólar Blue y cómo se determina su valor?
                                        </h3>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                            El Dólar Blue es el tipo de cambio informal que se comercializa de forma libre en el mercado informal de Argentina. Su cotización no está regulada por el Banco Central de la República Argentina (BCRA) y su valor fluctúa libremente según la oferta y la demanda de divisas en el mercado paralelo.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                                        <h3 className="text-sm font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                            ¿Cuál es la diferencia entre el Dólar MEP y el Dólar CCL?
                                        </h3>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                            Ambos son dólares financieros legales que se adquieren mediante la compra-venta de bonos o acciones en la bolsa de comercio argentina. El Dólar MEP (Mercado Electrónico de Pagos) se liquida e ingresa en cuentas bancarias locales de Argentina, mientras que el Dólar CCL (Contado con Liquidación) permite transferir las divisas resultantes a cuentas bancarias en el exterior.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                                        <h3 className="text-sm font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                            ¿Cómo se calcula el Dólar Tarjeta o Turista?
                                        </h3>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                            El Dólar Tarjeta se calcula tomando como base la cotización oficial minorista provista por el Banco de la Nación Argentina, y adicionándole la carga impositiva correspondiente para consumos en moneda extranjera. Estos recargos incluyen el Impuesto PAIS y percepciones correspondientes a cuenta de Impuesto a las Ganancias o Bienes Personales.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                                        <h3 className="text-sm font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                            ¿Qué es el Dólar Oficial Minorista?
                                        </h3>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                            El Dólar Oficial Minorista es el valor de referencia de venta al público en general en entidades financieras bancarias de Argentina, y sirve de base imponible para el cálculo del Dólar Tarjeta. Es informado de manera transparente por las instituciones reguladas por el BCRA.
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
