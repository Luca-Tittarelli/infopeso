'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { requireUser } from '@/lib/supabase/dal';
import { isUnsubscribeConfigured, unsubscribeUser } from '@/lib/email/unsubscribe';
import { isEmailConfigured, sendBatch } from '@/lib/email/resend';
import { buildDigestEmail, buildWelcomeEmail } from '@/lib/email/weeklyDigestEmail';
import { isAdminEmail } from '@/lib/adminEmails';
import { loadRemotePositions } from '@/lib/portfolio/positionsStore';
import { summarize } from '@/lib/portfolio/valuation';
import { arDate, toSnapshotRow, weeklyDigest } from '@/lib/portfolio/snapshot';
import { getQuotesAndMep } from '@/lib/portfolio/liveMarket';

// Desde /cuenta: el usuario activa o apaga su resumen semanal. RLS limita el update a su propio perfil.
export async function actualizarResumen(formData) {
    if (!isSupabaseConfigured) return;
    const user = await requireUser('/cuenta');
    const supabase = await createClient();
    const { error } = await supabase
        .from('profiles')
        .update({ weekly_email: formData.get('activo') === 'si' })
        .eq('id', user.id);
    if (error) console.warn('No se pudo actualizar el resumen semanal:', error.message);
    revalidatePath('/cuenta');
}

const TEST_WINDOW_DAYS = 35;

// Solo para cuentas admin (ver adminEmails.js): se manda a sí misma el resumen semanal para probar el envío.
// Usa las fotos guardadas más el valor de hoy (calculado en el momento, sin guardarlo). Con menos de dos fotos
// manda el mail de bienvenida. Va siempre a la dirección de la sesión, nunca a una escrita en el formulario.
export async function enviarResumenPrueba() {
    if (!isSupabaseConfigured) return { error: 'Las cuentas no están habilitadas.' };
    const user = await requireUser('/cuenta');
    if (!user.email_confirmed_at || !isAdminEmail(user.email)) return { error: 'No autorizado.' };
    if (!isEmailConfigured || !isUnsubscribeConfigured) {
        return { error: 'Faltan variables de correo en este entorno (RESEND_API_KEY, EMAIL_FROM y EMAIL_UNSUBSCRIBE_SECRET).' };
    }

    try {
        const supabase = await createClient();
        const { portfolioId, positions } = await loadRemotePositions(supabase);
        if (positions.length === 0) return { error: 'Tu cartera real está vacía: importá o cargá algún activo primero.' };

        const symbols = [...new Set(positions.filter((p) => p.kind !== 'cash').map((p) => p.symbol))];
        const { quotes, mep } = await getQuotesAndMep(symbols);
        if (quotes === null || mep === null) return { error: 'No se pudieron traer los precios de BYMA o el dólar MEP. Probá de nuevo en un rato.' };

        const today = arDate();
        const live = toSnapshotRow(summarize(positions, quotes, mep), today, portfolioId);
        if (!live) return { error: 'Tu cartera no tiene valor para calcular el resumen.' };

        const since = new Date(Date.parse(`${today}T00:00:00Z`) - TEST_WINDOW_DAYS * 86400000).toISOString().slice(0, 10);
        const { data, error } = await supabase
            .from('portfolio_snapshots')
            .select('snap_date, total_ars, total_usd, mep, holdings')
            .eq('portfolio_id', portfolioId)
            .gte('snap_date', since)
            .order('snap_date', { ascending: true });
        if (error) throw error;

        const snaps = [...(data ?? []).filter((s) => s.snap_date !== today), live];
        const digest = weeklyDigest(snaps);
        const mail = digest ? buildDigestEmail({ digest, userId: user.id }) : buildWelcomeEmail({ snapshot: live, userId: user.id });

        const { sent } = await sendBatch([{ to: user.email, ...mail, subject: `[Prueba] ${mail.subject}` }]);
        if (sent !== 1) return { error: 'Resend no aceptó el mail. Revisá la clave, el remitente y que el dominio esté verificado.' };
        return { ok: `Te enviamos el ${digest ? 'resumen semanal' : 'mail de bienvenida (todavía hay menos de dos fotos guardadas)'} a ${user.email}.` };
    } catch (err) {
        console.warn('Falló el envío de prueba del resumen:', err?.message ?? err);
        return { error: 'No pudimos armar el resumen de prueba. Probá de nuevo.' };
    }
}

// Desde el link del mail: confirma la baja con el link firmado (sin sesión).
export async function confirmarBaja(formData) {
    const u = String(formData.get('u') ?? '');
    const t = String(formData.get('t') ?? '');
    const ok = await unsubscribeUser(u, t);
    redirect(ok ? '/baja?listo=1' : '/baja?error=1');
}
