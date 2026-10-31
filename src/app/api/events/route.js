import { NextResponse } from 'next/server';
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const MAX_BODY = 2048;
const ANON_ID_RE = /^[A-Za-z0-9_-]{8,40}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Mismos nombres que el check de la tabla usage_events.
const EVENTS = new Set([
    'cartera_view', 'import_open', 'import_preview', 'import_success', 'import_error',
    'manual_add', 'demo_view', 'signup_cta', 'account_linked', 'email_visit',
]);
const PROP_KEYS = new Set(['logged', 'broker', 'rows', 'count', 'reason', 'location']);

const empty = (status) => new NextResponse(null, { status, headers: { 'Cache-Control': 'no-store' } });

// Solo claves conocidas y valores simples y cortos: acá nunca llegan montos, tickers ni datos personales.
function cleanProps(raw) {
    const out = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    for (const [key, value] of Object.entries(raw)) {
        if (!PROP_KEYS.has(key)) continue;
        if (typeof value === 'boolean') out[key] = value;
        else if (typeof value === 'number' && Number.isFinite(value)) out[key] = Math.round(value);
        else if (typeof value === 'string') out[key] = value.slice(0, 40);
    }
    return out;
}

// Quién es el usuario lo decide la sesión del servidor, nunca el navegador.
async function sessionUserId() {
    if (!isSupabaseConfigured) return null;
    try {
        const supabase = await createClient();
        const { data } = await supabase.auth.getClaims();
        const sub = data?.claims?.sub;
        return typeof sub === 'string' && UUID_RE.test(sub) ? sub : null;
    } catch {
        return null;
    }
}

// Eventos de uso del embudo (vio la cartera, importó, se registró…). Anónimos: un identificador aleatorio del navegador, sin IP.
export async function POST(request) {
    const origin = request.headers.get('origin');
    if (origin) {
        let host = null;
        try { host = new URL(origin).host; } catch { /* origen inválido */ }
        if (host !== request.headers.get('host')) return empty(403);
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY) return empty(413);

    let body;
    try { body = JSON.parse(raw); } catch { return empty(400); }

    const name = body?.name;
    const anonId = body?.anonId;
    if (!EVENTS.has(name) || typeof anonId !== 'string' || !ANON_ID_RE.test(anonId)) return empty(400);
    const path = typeof body.path === 'string' && body.path.startsWith('/') ? body.path.slice(0, 120) : null;

    if (!isAdminConfigured) return empty(204);

    const userId = await sessionUserId();
    const { error } = await createAdminClient().from('usage_events').insert({
        name, anon_id: anonId, user_id: userId, path, props: cleanProps(body.props),
    });
    if (error) console.warn('No se pudo guardar un evento de uso:', error.message);
    return empty(204);
}
