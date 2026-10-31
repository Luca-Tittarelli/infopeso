// Eventos de uso anónimos para medir el embudo (ver /api/events y las vistas metricas_* de supabase/schema.sql).
// Se identifica el navegador con un número al azar guardado en localStorage; no se envían IP, montos, tickers ni datos personales.
// Todo está envuelto en try/catch: medir nunca debe romper la página.

const ANON_KEY = 'infopeso_aid';
const LINKED_PREFIX = 'infopeso_linked_';
const sentOnce = new Set();
let memoryId = null;

function randomId() {
    try {
        return crypto.randomUUID().replace(/-/g, '');
    } catch {
        return Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join('').slice(0, 32).padEnd(16, '0');
    }
}

function anonId() {
    try {
        let id = localStorage.getItem(ANON_KEY);
        if (!id || !/^[A-Za-z0-9_-]{8,40}$/.test(id)) {
            id = randomId();
            localStorage.setItem(ANON_KEY, id);
        }
        return id;
    } catch {
        memoryId = memoryId ?? randomId();
        return memoryId;
    }
}

export function track(name, props = {}) {
    try {
        const body = JSON.stringify({ name, anonId: anonId(), path: window.location.pathname, props });
        const blob = new Blob([body], { type: 'application/json' });
        if (!(navigator.sendBeacon && navigator.sendBeacon('/api/events', blob))) {
            fetch('/api/events', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
        }
    } catch {
        // sin red, bloqueado o sin soporte: se ignora
    }
}

// Una sola vez por carga de página (por ejemplo cartera_view, que el cambio de pestañas vuelve a montar).
export function trackOnce(name, props) {
    if (sentOnce.has(name)) return;
    sentOnce.add(name);
    track(name, props);
}

// Primera vez que este navegador ve a ese usuario con sesión: une el embudo anónimo con el registro.
export function trackAccountLinked(userId) {
    try {
        const key = `${LINKED_PREFIX}${userId}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, '1');
        track('account_linked');
    } catch {
        // sin localStorage no se puede saber si ya se midió: mejor no medir que duplicar
    }
}
