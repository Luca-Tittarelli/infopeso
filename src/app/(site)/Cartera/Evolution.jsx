'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/pulso/Button';
import { Delta } from '@/components/pulso/Delta';
import LineChart from '@/charts/ChartLine';
import { createClient } from '@/lib/supabase/client';
import { arDate, daysBetween, toSeries, seriesChangePct } from '@/lib/portfolio/snapshot';
import { track } from '@/lib/track';

const MAX_POINTS = 400;
const shortDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' });

// Fotos diarias de la cartera del usuario (las guarda el servidor; RLS deja leer solo las propias).
function useSnapshots(user) {
    const userId = user?.id ?? null;
    const [state, setState] = useState({ userId: null, rows: null, failed: false });

    useEffect(() => {
        if (!userId) return;
        let alive = true;
        (async () => {
            const { data, error } = await createClient()
                .from('portfolio_snapshots')
                .select('snap_date, total_ars, total_usd')
                .order('snap_date', { ascending: false })
                .limit(MAX_POINTS);
            if (!alive) return;
            if (error) {
                console.warn('No se pudo leer el historial de la cartera:', error.message);
                setState({ userId, rows: [], failed: true });
            } else {
                setState({ userId, rows: [...data].reverse(), failed: false });
            }
        })();
        return () => { alive = false; };
    }, [userId]);

    // Mientras llegan los datos del usuario actual (o si cambió de usuario) no hay filas.
    return state.userId === userId && userId ? state : { rows: null, failed: false };
}

function Frame({ children }) {
    return (
        <article className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h3 className="label" style={{ color: 'var(--ink-muted)', margin: 0 }}>Cómo evoluciona tu cartera</h3>
            {children}
        </article>
    );
}

// Invitado: el historial necesita cuenta. Es el motivo concreto para registrarse.
function Invitation() {
    return (
        <Frame>
            <p className="body" style={{ margin: 0, color: 'var(--ink)', fontWeight: 700 }}>
                Seguí cuánto vale tu cartera en dólares, día a día.
            </p>
            <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                Con una cuenta gratis guardamos el valor de tu cartera cada día hábil y te mandamos un resumen por email los viernes: cuánto rindió lo que tenés y qué activo se movió más.
            </p>
            <div className="flex flex-wrap gap-3">
                <Button href="/registro?next=/Cartera" size="sm" onClick={() => track('signup_cta', { location: 'evolucion' })}>Crear cuenta gratis</Button>
                <Button href="/ingresar?next=/Cartera" size="sm" variant="secondary">Ya tengo cuenta</Button>
            </div>
        </Frame>
    );
}

export default function Evolution({ user, enabled, live, demo }) {
    const { rows, failed } = useSnapshots(user);
    const [currency, setCurrency] = useState('usd');
    const today = arDate();

    // Serie guardada + el punto de hoy en vivo (si todavía no hay foto de hoy y los precios cargaron).
    const series = useMemo(() => {
        if (!rows) return [];
        const base = toSeries(rows);
        if (live && base[base.length - 1]?.date !== today) base.push({ date: today, usd: live.usd, ars: live.ars });
        return base;
    }, [rows, live, today]);

    if (demo || !enabled) return null;
    if (!user) return <Invitation />;
    if (rows === null) return <Frame><p className="body-sm" style={{ margin: 0, color: 'var(--ink-subtle)' }} aria-busy="true">Cargando tu historial…</p></Frame>;

    if (failed) {
        return (
            <Frame>
                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>No pudimos cargar tu historial ahora. Tu cartera no se perdió: probá de nuevo más tarde.</p>
            </Frame>
        );
    }

    const hasUsd = series.some((p) => p.usd !== null);
    const cur = currency === 'usd' && hasUsd ? 'usd' : 'ars';
    const points = series.filter((p) => p[cur] !== null);

    if (rows.length < 2 || points.length < 2) {
        return (
            <Frame>
                <p className="body" style={{ margin: 0, color: 'var(--ink)', fontWeight: 700 }}>
                    {rows.length === 0 ? 'Ya estamos registrando tu cartera.' : 'Ya tenemos tu primer día registrado.'}
                </p>
                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                    {rows.length === 0
                        ? 'La primera foto se guarda hoy después del cierre del mercado (alrededor de las 18:30).'
                        : 'Con el próximo día hábil ya vas a ver la línea de evolución acá.'}
                    {' '}Los viernes te llega un resumen por email.
                </p>
            </Frame>
        );
    }

    const lastDate = points[points.length - 1].date;
    const weekIdx = points.reduce((found, p, i) => (daysBetween(p.date, lastDate) >= 7 ? i : found), -1);
    const weekChange = weekIdx >= 0 ? seriesChangePct(points, cur, weekIdx) : null;
    const totalChange = seriesChangePct(points, cur, 0);

    return (
        <Frame>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    {weekChange !== null && (
                        <span className="inline-flex items-center gap-2">
                            <Delta value={weekChange} pill />
                            <span className="body-sm" style={{ color: 'var(--ink-muted)' }}>últimos 7 días</span>
                        </span>
                    )}
                    {totalChange !== null && weekIdx !== 0 && (
                        <span className="inline-flex items-center gap-2">
                            <Delta value={totalChange} pill />
                            <span className="body-sm" style={{ color: 'var(--ink-muted)' }}>desde el {shortDate(points[0].date)}</span>
                        </span>
                    )}
                </div>
                {hasUsd && (
                    <div className="flex gap-2" role="group" aria-label="Moneda del gráfico">
                        {['usd', 'ars'].map((c) => (
                            <button key={c} type="button" aria-pressed={cur === c} className={cur === c ? 'pill-active' : 'pill-inactive'} style={{ minHeight: '44px' }} onClick={() => setCurrency(c)}>
                                {c === 'usd' ? 'Dólares MEP' : 'Pesos'}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div role="img" aria-label={`Evolución del valor de tu cartera en ${cur === 'usd' ? 'dólares' : 'pesos'}, desde el ${shortDate(points[0].date)} hasta el ${shortDate(lastDate)}`}>
                <LineChart labels={points.map((p) => shortDate(p.date))} dataset={points.map((p) => p[cur])} height={220} color="signal" />
            </div>
            <p className="body-sm" style={{ margin: 0, color: 'var(--ink-subtle)' }}>
                Es el valor total de la cartera cada día hábil al cierre: incluye lo que hayas sumado o retirado. {live && points[points.length - 1].date === today ? 'El último punto es el valor de ahora.' : ''}
            </p>
        </Frame>
    );
}
