import { useState, useEffect } from "react";
import { cotizacionesAPI } from "../apis";
import { Loading } from "../components/LoadingAnim";
import { ChangesCard } from "../components/cards/CambiosInfoCard";
import { fetchData } from "../utils/Fetch";
import { ErrorComponent } from "../components/Error";
import { filtrarUltimoMes } from "../utils/functions";
import { useDolar } from "../hooks/useDolar";

export default function Cambios() {
    const { dolar, dolarStatus, cotizaciones, cotizacionesStatus } = useDolar();
    const [others, setOthers] = useState(null);
    const [othersStatus, setOthersStatus] = useState('loading');

    const filtrarPorCasa = (data, casa) =>
        data.filter(c => c.casa === casa);

    useEffect(() => {
        const fetching = async () => {
            const res = await fetchData(cotizacionesAPI);
            setOthers(res.data);
            setOthersStatus(res.status);
        };
        fetching();
    }, []);

    useEffect(() => {
        document.title = `Infopeso — Cotizaciones al ${new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`;
        document.querySelector('meta[name="description"]')?.setAttribute('content',
            'Cotizaciones actualizadas del dólar en Argentina: Oficial, Blue, CCL, MEP y otras monedas. Datos en tiempo real.'
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
                        DolarAPI · ArgentinaDatos
                    </p>
                    <h1
                        className="text-3xl sm:text-4xl font-bold tracking-tight"
                        style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}
                    >
                        Tipos de cambio
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Precios de compra y venta actualizados al día de hoy
                    </p>
                </div>
            </div>

            <section className="px-5 sm:px-8 py-8">
                <div className="max-w-[1200px] mx-auto">

                    {/* ── Dólar ─────────────────────────────────── */}
                    <div className="flex items-center gap-3 mb-4">
                        <h2
                            className="text-xs font-semibold uppercase tracking-[0.1em]"
                            style={{ color: 'var(--text-tertiary)', fontFamily: 'General Sans, system-ui' }}
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
                                .map((item, key) => (
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
                                            cotizaciones={{
                                                status: cotizacionesStatus,
                                                data: filtrarPorCasa(
                                                    filtrarUltimoMes(cotizaciones),
                                                    item.casa
                                                ),
                                            }}
                                        />
                                    </div>
                                ))}
                        </div>
                    )}

                    {/* ── Otras monedas ─────────────────────────── */}
                    <div className="flex items-center gap-3 mt-10 mb-4">
                        <h2
                            className="text-xs font-semibold uppercase tracking-[0.1em]"
                            style={{ color: 'var(--text-tertiary)', fontFamily: 'General Sans, system-ui' }}
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
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-center mt-8" style={{ color: 'var(--text-tertiary)' }}>
                                Fuente:{' '}
                                <a href="https://dolarapi.com" className="hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">DolarAPI</a>
                            </p>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
