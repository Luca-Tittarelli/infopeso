/**
 * News fetcher using Google News RSS via Vite dev proxy (/gnews-rss).
 * The Vite server proxies /gnews-rss -> news.google.com to bypass CORS.
 * Uses when:3d in the search query to restrict results to last 3 days on Google's side,
 * plus a client-side 14-day cutoff as a safety net.
 */

const MAX_AGE_DAYS = 14; // discard anything older than 14 days

// Financial keyword whitelist - must match at least one to show
const FINANCIAL_KEYWORDS = [
    'dólar', 'dolar', 'dollar', 'bcra', 'tasa', 'inflación', 'inflacion', 'ipc', 'indec',
    'reservas', 'bono', 'bonos', 'al30', 'gd30', 'mep', 'ccl', 'brecha',
    'cepo', 'tipo de cambio', 'lecap', 'letras', 'merval', 'riesgo país',
    'riesgo pais', 'fmi', 'deuda', 'licitación', 'licitacion', 'swap',
    'devaluación', 'devaluacion', 'crawling', 'obligación', 'obligacion',
    'bolsa', 'acciones', 'tir', 'rendimiento', 'cnv', 'afip', 'retenciones',
    'arancel', 'economía', 'economia', 'mercado cambiario', 'banco central',
    'carry', 'blue', 'peso argentino', 'divisa'
];

export function detectCategory(title) {
    const t = title.toLowerCase();
    if (t.includes('dólar') || t.includes('dolar') || t.includes('dollar') ||
        t.includes('tipo de cambio') || t.includes('mep') || t.includes('ccl') ||
        t.includes('cepo') || t.includes('blue') || t.includes('brecha') ||
        t.includes('divisa') || t.includes('cambi')) {
        return { label: 'Tipo de Cambio', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
    }
    if (t.includes('inflación') || t.includes('inflacion') || t.includes('ipc') ||
        t.includes('indec') || t.includes('precios') || t.includes('tarifas')) {
        return { label: 'Inflación', color: '#F97316', bg: 'rgba(249,115,22,0.12)' };
    }
    if (t.includes('bcra') || t.includes('tasa') || t.includes('reservas') ||
        t.includes('banco central') || t.includes('lecap') || t.includes('swap') ||
        t.includes('carry') || t.includes('base monetaria')) {
        return { label: 'Política Monetaria', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' };
    }
    if (t.includes('bono') || t.includes('bonos') || t.includes('al30') || t.includes('gd30') ||
        t.includes('deuda') || t.includes('fmi') || t.includes('licitaci') ||
        t.includes('obligaci') || t.includes('tir') || t.includes('rendimiento')) {
        return { label: 'Deuda & Bonos', color: '#10B981', bg: 'rgba(16,185,129,0.12)' };
    }
    if (t.includes('bolsa') || t.includes('merval') || t.includes('acciones') ||
        t.includes('cnv') || t.includes('cedear')) {
        return { label: 'Mercado', color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' };
    }
    if (t.includes('retenciones') || t.includes('arancel') || t.includes('afip') ||
        t.includes('decreto') || t.includes('resolución') || t.includes('regulac')) {
        return { label: 'Regulaciones', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
    }
    return { label: 'Economía', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
}

function isFinancialNews(title) {
    const t = title.toLowerCase();
    return FINANCIAL_KEYWORDS.some(k => t.includes(k));
}

function isRecent(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date)) return false;
    const ageDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    return ageDays <= MAX_AGE_DAYS;
}

function parseXMLFeed(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) throw new Error('XML parse error');

    const items = Array.from(doc.querySelectorAll('item'));
    return items.map(item => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent ||
                     item.querySelector('guid')?.textContent || '#';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const source = item.querySelector('source')?.textContent || 'Google News';

        return { title, link, pubDate, source };
    });
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return '';
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)}d`;
}

/**
 * Fetch financial news via the Vite dev proxy (/gnews-rss -> news.google.com).
 * The `when:3d` parameter tells Google News to only return articles from the last 3 days.
 * Client-side MAX_AGE_DAYS filter acts as an additional safety net.
 */
export async function fetchFinancialNews() {
    // when:3d tells Google News to restrict results to the last 3 days
    const query = encodeURIComponent('BCRA dólar argentina economía inflación bonos when:3d');
    const proxyUrl = `/gnews-rss/rss/search?q=${query}&hl=es-419&gl=AR&ceid=AR%3Aes-419`;

    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();
    const raw = parseXMLFeed(xml);

    const filtered = raw
        .filter(item => isFinancialNews(item.title) && isRecent(item.pubDate))
        .slice(0, 8)
        .map(item => ({
            id: item.link,
            title: item.title,
            link: item.link,
            date: item.pubDate,
            timeAgo: timeAgo(item.pubDate),
            source: item.source,
            category: detectCategory(item.title),
        }));

    return filtered;
}
