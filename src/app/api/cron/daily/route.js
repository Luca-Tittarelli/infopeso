import { NextResponse } from 'next/server';
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin';
import { getQuotesAndMep } from '@/lib/portfolio/liveMarket';
import { sanitizePositions } from '@/lib/portfolio/positionsStore';
import { summarize } from '@/lib/portfolio/valuation';
import { arDate, arWeekday, toSnapshotRow, weeklyDigest } from '@/lib/portfolio/snapshot';
import { isEmailConfigured, sendBatch } from '@/lib/email/resend';
import { isUnsubscribeConfigured } from '@/lib/email/unsubscribe';
import { buildDigestEmail, buildWelcomeEmail } from '@/lib/email/weeklyDigestEmail';

export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;
const PAGE = 1000;
const UPSERT_CHUNK = 200;
const IN_CHUNK = 100;
const SNAPSHOT_WINDOW_DAYS = 35;

const json = (body, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const chunks = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size));

// Todas las posiciones guardadas, agrupadas por cartera.
async function loadPositionsByPortfolio(admin) {
    const byPortfolio = new Map();
    for (let from = 0; ; from += PAGE) {
        const { data, error } = await admin
            .from('portfolio_positions')
            .select('portfolio_id, broker, symbol, kind, quantity, avg_cost, currency, file_value')
            .order('id')
            .range(from, from + PAGE - 1);
        if (error) throw error;
        for (const r of data ?? []) {
            const list = byPortfolio.get(r.portfolio_id) ?? [];
            list.push({
                broker: r.broker, symbol: r.symbol, kind: r.kind, currency: r.currency,
                quantity: Number(r.quantity), avgCost: r.avg_cost, fileValue: r.file_value,
            });
            byPortfolio.set(r.portfolio_id, list);
        }
        if (!data || data.length < PAGE) break;
    }
    return byPortfolio;
}

async function sendWeekly(admin, today) {
    if (!isEmailConfigured || !isUnsubscribeConfigured) return { status: 'desactivado' };

    const { data: recipients, error } = await admin.rpc('weekly_digest_recipients');
    if (error) throw error;
    if (!recipients?.length) return { status: 'ok', recipients: 0, sent: 0, failed: 0 };

    const since = new Date(Date.parse(`${today}T00:00:00Z`) - SNAPSHOT_WINDOW_DAYS * 86400000).toISOString().slice(0, 10);
    const snapshotsByPortfolio = new Map();
    for (const ids of chunks([...new Set(recipients.map((r) => r.portfolio_id))], IN_CHUNK)) {
        const { data, error: snapError } = await admin
            .from('portfolio_snapshots')
            .select('portfolio_id, snap_date, total_ars, total_usd, mep, holdings')
            .in('portfolio_id', ids)
            .gte('snap_date', since)
            .order('snap_date', { ascending: true });
        if (snapError) throw snapError;
        for (const s of data ?? []) {
            const list = snapshotsByPortfolio.get(s.portfolio_id) ?? [];
            list.push(s);
            snapshotsByPortfolio.set(s.portfolio_id, list);
        }
    }

    const messages = [];
    for (const r of recipients) {
        const snaps = snapshotsByPortfolio.get(r.portfolio_id) ?? [];
        // Solo si hay foto de hoy: sin datos de hoy el resumen sería de otra semana.
        if (snaps.length === 0 || snaps[snaps.length - 1].snap_date !== today) continue;
        const digest = weeklyDigest(snaps);
        const mail = digest
            ? buildDigestEmail({ digest, userId: r.user_id })
            : buildWelcomeEmail({ snapshot: snaps[snaps.length - 1], userId: r.user_id });
        messages.push({ to: r.email, ...mail });
    }

    const result = messages.length ? await sendBatch(messages, `weekly-digest-${today}`) : { sent: 0, failed: 0 };
    return { status: 'ok', recipients: recipients.length, ...result };
}

// Se ejecuta todos los días hábiles después del cierre de BYMA (vercel.json). Guarda la foto del día de cada cartera
// y los viernes envía el resumen semanal. Solo responde con el secreto del cron.
export async function GET(request) {
    if (!CRON_SECRET || !isAdminConfigured) return json({ error: 'El cron no está configurado' }, 503);
    if (request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) return json({ error: 'No autorizado' }, 401);

    // Solo para pruebas locales: permite simular otra fecha.
    const fake = process.env.CRON_TEST_MODE === '1' ? new URL(request.url).searchParams.get('now') : null;
    const now = fake && !Number.isNaN(Date.parse(fake)) ? new Date(fake) : new Date();
    const today = arDate(now);
    const weekday = arWeekday(now);

    if (weekday === 0 || weekday === 6) return json({ date: today, skipped: 'fin de semana' });

    try {
        const admin = createAdminClient();
        const byPortfolio = await loadPositionsByPortfolio(admin);

        const symbols = [...new Set(
            [...byPortfolio.values()].flat().filter((p) => p.kind !== 'cash').map((p) => String(p.symbol).toUpperCase())
        )];
        const { quotes, mep } = await getQuotesAndMep(symbols);

        // Sin precios o sin dólar MEP las fotos saldrían mal valuadas y ensuciarían el historial: mejor no guardar nada hoy.
        if (quotes === null) return json({ date: today, error: 'Sin cotizaciones de BYMA' }, 502);
        if (mep === null) return json({ date: today, error: 'Sin dólar MEP' }, 502);

        const rows = [];
        for (const [portfolioId, raw] of byPortfolio) {
            const positions = sanitizePositions(raw);
            if (!positions.length) continue;
            const row = toSnapshotRow(summarize(positions, quotes, mep), today, portfolioId);
            if (row) rows.push(row);
        }
        for (const part of chunks(rows, UPSERT_CHUNK)) {
            const { error } = await admin.from('portfolio_snapshots').upsert(part, { onConflict: 'portfolio_id,snap_date' });
            if (error) throw error;
        }

        const email = weekday === 5 ? await sendWeekly(admin, today) : { status: 'no es viernes' };
        return json({ date: today, snapshots: rows.length, email });
    } catch (err) {
        console.error('Falló el cron diario:', err);
        return json({ date: today, error: 'Error interno' }, 500);
    }
}
