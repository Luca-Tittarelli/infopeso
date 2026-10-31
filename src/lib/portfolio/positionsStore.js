// Persistencia de las posiciones de la cartera real.
// Sin sesión: localStorage. Con sesión: tabla portfolio_positions de Supabase (RLS limita todo al dueño).

export const POSITIONS_KEY = 'infopeso_positions_v1';
export const MAX_POSITIONS = 300;
export const KINDS = ['stock', 'cedear', 'bond', 'note', 'corp', 'fund', 'cash', 'other'];

const SYMBOL_RE = /^[A-Z0-9.^=-]{1,20}$/;

// Descarta lo que no cumpla las reglas de la base (así un archivo local alterado no rompe el guardado).
export function sanitizePositions(list) {
    if (!Array.isArray(list)) return [];
    return list
        .map((p) => ({
            broker: String(p?.broker ?? 'Manual').trim().slice(0, 40) || 'Manual',
            symbol: String(p?.symbol ?? '').trim().toUpperCase(),
            kind: KINDS.includes(p?.kind) ? p.kind : 'other',
            currency: p?.currency === 'USD' ? 'USD' : 'ARS',
            quantity: Number(p?.quantity),
            avgCost: p?.avgCost === null || p?.avgCost === undefined || p?.avgCost === '' ? null : Number(p.avgCost),
            fileValue: p?.fileValue === null || p?.fileValue === undefined || p?.fileValue === '' ? null : Number(p.fileValue),
        }))
        .filter((p) => SYMBOL_RE.test(p.symbol) && Number.isFinite(p.quantity) && p.quantity >= 0)
        .map((p) => ({
            ...p,
            avgCost: Number.isFinite(p.avgCost) && p.avgCost >= 0 ? p.avgCost : null,
            fileValue: Number.isFinite(p.fileValue) && p.fileValue >= 0 ? p.fileValue : null,
        }))
        .slice(0, MAX_POSITIONS);
}

// ─── Navegador (usuarios sin cuenta) ──────────────────────────────────────────

export function readLocalPositions() {
    try {
        const parsed = JSON.parse(localStorage.getItem(POSITIONS_KEY) || 'null');
        return sanitizePositions(parsed?.positions);
    } catch {
        return [];
    }
}

export function writeLocalPositions(positions) {
    try {
        localStorage.setItem(POSITIONS_KEY, JSON.stringify({ positions, updatedAt: new Date().toISOString() }));
    } catch {
        // almacenamiento lleno o bloqueado: la cartera sigue en memoria durante la sesión
    }
}

export function clearLocalPositions() {
    try {
        localStorage.removeItem(POSITIONS_KEY);
    } catch {
        // sin acceso a localStorage
    }
}

// ─── Supabase (usuarios con cuenta) ───────────────────────────────────────────

// Cartera de tipo "real" del usuario; la crea si todavía no existe.
async function getRealPortfolioId(supabase) {
    const found = await supabase
        .from('portfolios')
        .select('id')
        .eq('kind', 'real')
        .order('created_at', { ascending: true })
        .limit(1);
    if (found.error) throw found.error;
    if (found.data?.length) return found.data[0].id;

    const created = await supabase
        .from('portfolios')
        .insert({ name: 'Mi cartera real', kind: 'real' })
        .select('id')
        .single();
    if (created.error) throw created.error;
    return created.data.id;
}

export async function loadRemotePositions(supabase) {
    const portfolioId = await getRealPortfolioId(supabase);
    const { data, error } = await supabase
        .from('portfolio_positions')
        .select('broker, symbol, kind, quantity, avg_cost, currency, file_value')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: true });
    if (error) throw error;

    const positions = sanitizePositions(
        (data ?? []).map((r) => ({
            broker: r.broker, symbol: r.symbol, kind: r.kind, currency: r.currency,
            quantity: Number(r.quantity), avgCost: r.avg_cost, fileValue: r.file_value,
        }))
    );
    return { portfolioId, positions };
}

export async function saveRemotePositions(supabase, portfolioId, positions) {
    const items = sanitizePositions(positions).map((p) => ({
        broker: p.broker, symbol: p.symbol, kind: p.kind, quantity: p.quantity,
        avg_cost: p.avgCost, currency: p.currency, file_value: p.fileValue,
    }));
    const { error } = await supabase.rpc('replace_portfolio_positions', { p_portfolio_id: portfolioId, p_items: items });
    if (error) throw error;
}

// ─── Operaciones sobre la lista (puras) ───────────────────────────────────────

// Reimportar un broker reemplaza solo las posiciones de ese broker; las de los demás quedan intactas.
export function replaceBroker(positions, broker, incoming) {
    return sanitizePositions([...positions.filter((p) => p.broker !== broker), ...incoming.map((p) => ({ ...p, broker }))]);
}

// Agregar a mano suma la cantidad si el ticker ya existe en ese broker.
export function addPosition(positions, item) {
    const next = [...positions];
    const i = next.findIndex((p) => p.broker === item.broker && p.symbol === item.symbol);
    if (i === -1) next.push(item);
    else {
        next[i] = {
            ...next[i],
            quantity: next[i].quantity + item.quantity,
            fileValue: next[i].fileValue !== null && item.fileValue !== null ? next[i].fileValue + item.fileValue : item.fileValue ?? next[i].fileValue,
        };
    }
    return sanitizePositions(next);
}

export const removePosition = (positions, broker, symbol) =>
    positions.filter((p) => !(p.broker === broker && p.symbol === symbol));

export const brokersOf = (positions) => [...new Set(positions.map((p) => p.broker))];
