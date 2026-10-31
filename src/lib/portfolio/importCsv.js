// Importador de tenencias desde archivos CSV de brokers argentinos. Módulo puro (sin React ni red).
//
// Formatos verificados con archivos reales: Cocos Capital (instrumento;cantidad;precio;moneda;total).
// IOL, Balanz y Bull Market se reconocen por sinónimos de columnas y, si el archivo es distinto,
// el usuario elige qué columna es cada dato (paso de mapeo manual).

export const BROKERS = [
    { id: 'Cocos', label: 'Cocos Capital' },
    { id: 'IOL', label: 'IOL InvertirOnline' },
    { id: 'Balanz', label: 'Balanz' },
    { id: 'Bull Market', label: 'Bull Market' },
    { id: 'Otro', label: 'Otro broker' },
];

export const ROLES = [
    { id: 'symbol', label: 'Ticker o instrumento', required: true },
    { id: 'quantity', label: 'Cantidad', required: true },
    { id: 'total', label: 'Valor total (opcional)', required: false },
    { id: 'price', label: 'Precio (opcional)', required: false },
    { id: 'cost', label: 'Precio de compra (opcional)', required: false },
    { id: 'currency', label: 'Moneda (opcional)', required: false },
];

const SYNONYMS = {
    symbol: ['instrumento', 'ticker', 'simbolo', 'especie', 'activo', 'instrument', 'symbol', 'codigo', 'titulo', 'denominacion'],
    quantity: ['cantidad', 'cant', 'qty', 'quantity', 'nominales', 'tenencia', 'cantidad disponible', 'cantidad total', 'cant total'],
    price: ['precio', 'ultimo', 'ultimo precio', 'cotizacion', 'price', 'precio actual', 'precio mercado', 'precio de mercado'],
    currency: ['moneda', 'currency', 'divisa'],
    total: ['total', 'monto', 'valor', 'importe', 'valuacion', 'valorizado', 'valor total', 'market value', 'valuacion total', 'valor de mercado', 'monto total'],
    cost: ['ppc', 'ppp', 'precio promedio', 'precio compra', 'precio de compra', 'costo promedio', 'costo', 'precio promedio compra'],
};

// Si no hay coincidencia exacta se busca por palabra clave, en este orden (cost antes que price: "precio promedio").
const KEYWORDS = [
    ['cost', /(ppc|ppp|promedio|compra|costo)/],
    ['total', /(total|valoriz|valuaci|monto|importe)/],
    ['quantity', /(cantidad|nominal|tenencia)/],
    ['price', /(precio|ultimo|cotiz)/],
    ['symbol', /(ticker|simbolo|especie|instrumento|activo)/],
    ['currency', /(moneda|divisa)/],
];

export const normalizeHeader = (s) =>
    String(s ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

// ─── Lectura del archivo ──────────────────────────────────────────────────────

function splitLines(text, delimiter) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quoted) {
            if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
            else if (ch === '"') quoted = false;
            else cell += ch;
        } else if (ch === '"') {
            quoted = true;
        } else if (ch === delimiter) {
            row.push(cell); cell = '';
        } else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(cell); cell = '';
            rows.push(row); row = [];
        } else {
            cell += ch;
        }
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}

function detectDelimiter(text) {
    const firstLines = text.split(/\r?\n/).slice(0, 5).join('\n');
    const counts = { ';': 0, ',': 0, '\t': 0 };
    let quoted = false;
    for (const ch of firstLines) {
        if (ch === '"') quoted = !quoted;
        else if (!quoted && ch in counts) counts[ch]++;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

// Convierte "1.234,56", "1,234.56", "1,16" o "$ 1.234" en número, según el estilo del archivo.
export function parseNumber(raw, style = 'comma') {
    if (raw === null || raw === undefined) return null;
    let s = String(raw).trim();
    if (s === '' || s === '-') return null;
    const negative = /^\(.*\)$/.test(s) || /^-/.test(s) || /−/.test(s);
    s = s.replace(/[^\d.,]/g, '');
    if (!/\d/.test(s)) return null;

    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    let normalized;
    if (lastComma !== -1 && lastDot !== -1) {
        const decimalSep = lastComma > lastDot ? ',' : '.';
        const thousandsSep = decimalSep === ',' ? '.' : ',';
        normalized = s.split(thousandsSep).join('').replace(decimalSep, '.');
    } else if (lastComma !== -1) {
        const thousandsGroups = /^\d{1,3}(,\d{3})+$/.test(s);
        normalized = thousandsGroups && style !== 'comma' ? s.replace(/,/g, '') : s.replace(/,/g, '.');
    } else if (lastDot !== -1) {
        const thousandsGroups = /^\d{1,3}(\.\d{3})+$/.test(s);
        normalized = thousandsGroups && style === 'comma' ? s.replace(/\./g, '') : s;
    } else {
        normalized = s;
    }
    const n = Number(normalized);
    if (!Number.isFinite(n)) return null;
    return negative ? -n : n;
}

// Mira todas las celdas numéricas: "1.234,5" o "0,02" indican coma decimal; "1,234.5" o "0.02", punto decimal.
function detectNumberStyle(rows, delimiter) {
    let comma = 0;
    let dot = 0;
    for (const row of rows) {
        for (const cell of row) {
            const c = String(cell).trim();
            if (/\d\.\d{3},\d/.test(c) || /\d,\d{1,2}$/.test(c) || /\d,\d{4,}$/.test(c)) comma++;
            else if (/\d,\d{3}\.\d/.test(c) || /\d\.\d{1,2}$/.test(c) || /\d\.\d{4,}$/.test(c)) dot++;
        }
    }
    if (comma === dot) return delimiter === ';' ? 'comma' : 'dot';
    return comma > dot ? 'comma' : 'dot';
}

function detectMapping(headers) {
    const norm = headers.map(normalizeHeader);
    const mapping = {};
    const used = new Set();
    for (const [role, list] of Object.entries(SYNONYMS)) {
        const idx = norm.findIndex((h, i) => !used.has(i) && list.includes(h));
        if (idx !== -1) { mapping[role] = idx; used.add(idx); }
    }
    for (const [role, re] of KEYWORDS) {
        if (mapping[role] !== undefined) continue;
        const idx = norm.findIndex((h, i) => !used.has(i) && re.test(h));
        if (idx !== -1) { mapping[role] = idx; used.add(idx); }
    }
    return mapping;
}

const scoreHeaderRow = (row) => Object.keys(detectMapping(row)).length;

// Lee el texto del archivo: devuelve encabezados, filas de datos, el mapeo detectado y el estilo numérico.
export function parseCsvText(rawText) {
    const text = String(rawText ?? '').replace(/^﻿/, '');
    if (!text.trim()) return { error: 'El archivo está vacío.' };

    const delimiter = detectDelimiter(text);
    const all = splitLines(text, delimiter);
    if (all.length < 2) return { error: 'El archivo no tiene filas de datos.' };

    // Algunos brokers anteponen títulos: la fila de encabezados es la primera (entre las 15 primeras) con más columnas reconocibles.
    let headerIndex = 0;
    let best = -1;
    all.slice(0, 15).forEach((row, i) => {
        const score = scoreHeaderRow(row);
        if (score > best) { best = score; headerIndex = i; }
    });

    const headers = all[headerIndex].map((h) => String(h).trim());
    const rows = all.slice(headerIndex + 1);
    const mapping = detectMapping(headers);
    const style = detectNumberStyle(rows, delimiter);
    const norm = headers.map(normalizeHeader).join('|');
    const broker = norm === 'instrumento|cantidad|precio|moneda|total' ? 'Cocos' : null;

    return { delimiter, headers, rows, mapping, style, detectedBroker: broker };
}

// ─── Filas → posiciones ───────────────────────────────────────────────────────

const stripAccents = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');

function cashCurrency(raw) {
    const s = stripAccents(raw).toLowerCase().trim();
    if (/^(ars|\$|pesos?|peso argentino|efectivo ars|saldo ars|pesos argentinos)$/.test(s)) return 'ARS';
    if (/^(usd|us\$|u\$s|u\$d|dolar(es)?|usd mep|dolar mep|dolares mep|usd cable|dolar cable|usdc?|usd ccl)$/.test(s)) return 'USD';
    return null;
}

function currencyFromColumn(raw) {
    const s = stripAccents(raw ?? '').toLowerCase();
    if (/(usd|u\$s|us\$|dolar|dollar)/.test(s)) return 'USD';
    if (/(ars|peso|\$)/.test(s)) return 'ARS';
    return null;
}

// "GGAL - Grupo Financiero Galicia", "ggal.ba" o "GGAL" → "GGAL". Devuelve null si parece un nombre sin ticker.
export function extractTicker(raw) {
    const cleaned = stripAccents(raw).toUpperCase().trim().replace(/\.BA\b/g, '');
    if (/^[A-Z0-9]{2,12}$/.test(cleaned)) return cleaned;
    // "AL30 - Bonar 2030": el ticker va primero y lo separa un guion o dos puntos. Un nombre con espacios ("Grupo Galicia") no es un ticker.
    const withDescription = cleaned.match(/^([A-Z0-9]{2,12})\s*[-–—:|]\s+\S/);
    return withDescription ? withDescription[1] : null;
}

// Convierte las filas en posiciones pendientes de clasificar (el tipo y la moneda reales los define la cotización).
export function buildPositions(parsed, mapping, broker) {
    const { rows, style } = parsed;
    const get = (row, role) => (mapping[role] === undefined || mapping[role] === '' ? undefined : row[Number(mapping[role])]);
    const merged = new Map();
    const skipped = [];

    rows.forEach((row, i) => {
        const symbolRaw = String(get(row, 'symbol') ?? '').trim();
        if (!symbolRaw) return;
        const quantity = parseNumber(get(row, 'quantity'), style);
        const total = parseNumber(get(row, 'total'), style);
        const price = parseNumber(get(row, 'price'), style);
        const cost = parseNumber(get(row, 'cost'), style);
        const colCurrency = currencyFromColumn(get(row, 'currency'));

        const cash = cashCurrency(symbolRaw);
        if (cash) {
            const amount = quantity ?? total;
            if (amount && amount > 0) {
                const key = `cash:${cash}`;
                const prev = merged.get(key);
                merged.set(key, {
                    broker, symbol: cash, kind: 'cash', currency: cash,
                    quantity: (prev?.quantity ?? 0) + amount, fileValue: (prev?.fileValue ?? 0) + amount,
                    avgCost: null, label: symbolRaw, status: 'ok',
                });
            }
            return;
        }

        const ticker = extractTicker(symbolRaw);
        if (!ticker) {
            skipped.push({ line: i + 1, raw: symbolRaw, reason: 'No encontramos un ticker en esta fila.' });
            return;
        }
        if (!quantity || quantity <= 0) {
            skipped.push({ line: i + 1, raw: symbolRaw, reason: 'La cantidad está vacía o es cero.' });
            return;
        }

        const fileValue = total ?? (price !== null ? price * quantity : null);
        const prev = merged.get(ticker);
        if (prev) {
            // Mismo ticker repetido en el archivo (por ejemplo, por plazo de liquidación): se suman las cantidades.
            const q = prev.quantity + quantity;
            prev.avgCost = prev.avgCost !== null && cost !== null ? (prev.avgCost * prev.quantity + cost * quantity) / q : null;
            prev.fileValue = prev.fileValue !== null && fileValue !== null ? prev.fileValue + fileValue : null;
            prev.quantity = q;
        } else {
            merged.set(ticker, {
                broker, symbol: ticker, kind: 'pending', currency: colCurrency || 'ARS',
                quantity, fileValue, avgCost: cost, label: symbolRaw, status: 'pending',
            });
        }
    });

    return { positions: [...merged.values()], skipped };
}

// Aplica las cotizaciones de BYMA a las posiciones: define el tipo y la moneda reales de cada ticker.
export function classifyPositions(positions, quotes) {
    return positions.map((p) => {
        if (p.kind === 'cash') return p;
        const q = quotes?.[p.symbol];
        if (q) return { ...p, kind: q.kind, currency: q.currency, status: 'ok' };
        // Sin cotización en BYMA (FCI, activos del exterior, etc.): se valúa con el monto del archivo, si lo trae.
        if (p.fileValue !== null && p.fileValue > 0) return { ...p, kind: 'other', status: 'sin-precio' };
        return { ...p, kind: 'other', status: 'no-reconocido' };
    });
}

// Tickers candidatos del archivo, para consultar sus cotizaciones.
export const candidateSymbols = (positions) => positions.filter((p) => p.kind !== 'cash').map((p) => p.symbol);
