import { parseXMLFeed } from '@/utils/newsFetcher';

// Noticias recientes de una empresa del catálogo de la Cartera, desde Google News (en español, edición Argentina).
//
// Se hace una búsqueda por empresa y solo se queda con titulares que nombran a la empresa: así cada noticia
// llega ya asociada a su ticker, en vez de adivinarlo después sobre una búsqueda conjunta.

const MAX_AGE_DAYS = 7;
const PER_COMPANY = 5;

// Para las del exterior se suma contexto financiero: "Microsoft" a secas trae más tecnología que mercado.
const FINANCE_CONTEXT = '(acciones OR resultados OR inversores OR balance OR "Wall Street")';

// Nombres ambiguos o que la prensa escribe distinto. `terms` son las formas que tiene que mencionar el titular
// (siempre respetando mayúsculas: "Meta" la empresa, no "la meta de inflación").
const OVERRIDES = {
    'YPFD.BA': { query: '"YPF"', terms: ['YPF'] },
    VIST: { query: '"Vista Energy" OR "Vista Oil"', terms: ['Vista Energy', 'Vista Oil', 'Vista'] },
    // "Galicia" a secas trae noticias de la región española.
    'GGAL.BA': { query: '"Banco Galicia" OR "Grupo Galicia" OR "Grupo Financiero Galicia" OR GGAL', terms: ['Banco Galicia', 'Grupo Galicia', 'Grupo Financiero Galicia', 'GGAL'] },
    'TGSU2.BA': { query: '"Transportadora de Gas del Sur" OR "TGS"', terms: ['TGS', 'Transportadora de Gas del Sur'] },
    'BBAR.BA': { query: '"BBVA" argentina', terms: ['BBVA'] },
    'GBAN.BA': { query: '"Naturgy" argentina', terms: ['Naturgy'] },
    'SAMI.BA': { query: '"San Miguel" (limones OR cítricos OR SAMI OR acciones)', terms: ['San Miguel'] },
    META: { query: `("Meta" OR Zuckerberg) ${FINANCE_CONTEXT}`, terms: ['Meta', 'META', 'Zuckerberg'] },
    NU: { query: '"Nubank" OR "Nu Holdings"', terms: ['Nubank', 'Nu Holdings'] },
    MELI: { query: `("Mercado Libre" OR MercadoLibre) ${FINANCE_CONTEXT}`, terms: ['Mercado Libre', 'MercadoLibre', 'MELI'] },
    NVDA: { terms: ['Nvidia', 'NVIDIA'] },
    GOOGL: { query: `("Google" OR "Alphabet") ${FINANCE_CONTEXT}`, terms: ['Google', 'Alphabet'] },
    KO: { query: `("Coca-Cola" OR "Coca Cola") ${FINANCE_CONTEXT}`, terms: ['Coca-Cola', 'Coca Cola'] },
    SKHY: { terms: ['SK hynix', 'SK Hynix'] },
    MSTR: { query: '"Strategy" (bitcoin OR Saylor OR MSTR)', terms: ['Strategy', 'MicroStrategy', 'MSTR'] },
    DOW: { query: '"Dow Inc" OR "Dow Chemical"', terms: ['Dow Inc', 'Dow Chemical'] },
    VALE: { query: '"Vale" (minera OR mineral OR hierro OR acciones)', terms: ['Vale'] },
};

// "Holcim Argentina" → "Holcim", "Grupo Supervielle" → "Supervielle": la prensa local suele usar la forma corta.
const shortLocalName = (name) => name.replace(/\s+(Argentina|Holding)$/i, '').replace(/^Grupo\s+/i, '');

export function newsSearchFor(company) {
    const o = OVERRIDES[company.symbol] ?? {};
    const local = company.category === 'Argentina';
    const short = local ? shortLocalName(company.name) : company.name;
    const query = o.query ?? (local
        ? `"${short}"${short !== company.name ? ' argentina' : ''}`
        : `"${company.name}" ${FINANCE_CONTEXT}`);
    const terms = o.terms ?? [...new Set([company.name, short])];
    return { query, terms };
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const mentions = (title, term) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(term)}($|[^\\p{L}\\p{N}])`, 'u').test(title);

const ENTITIES = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
const decode = (s) => s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);

// Páginas de cotización que Google News indexa como noticias ("Gráfico de rentabilidades estacionales de...").
const isQuotePage = (title, source) =>
    /gr[aá]fico de (rentabilidades|rendimientos)|estado de resultados de|cadena de opciones|previsi[oó]n de las acciones/i.test(title)
    || (/yahoo/i.test(source) && /\([A-Z0-9.^-]{1,12}\)\s*$/.test(title));

// Google devuelve también notas en inglés (TradingView, Investing): con dos o más de estas palabras, el titular es en español.
const SPANISH_WORDS = /(?<![\p{L}])(de|del|la|las|el|los|en|y|que|por|con|para|tras|sus|su)(?![\p{L}])/giu;

const FINANCE_WORDS = /acci[oó]n|acciones|resultado|balance|ganancia|p[eé]rdida|ingresos|ventas|dividendo|inversi[oó]n|inversores|analistas|precio objetivo|wall street|bolsa|cotiza|bonos|obligaciones|emisi[oó]n|deuda|adquisici|compra|fusi[oó]n|producci[oó]n|export|trimestre/i;

export async function fetchCompanyNews(company) {
    const { query, terms } = newsSearchFor(company);
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:${MAX_AGE_DAYS}d`)}&hl=es-419&gl=AR&ceid=AR%3Aes-419`;
    // La caché de fetch es por URL: cada empresa se pide como mucho una vez cada 15 minutos, sin importar la cartera.
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`Google News ${res.status}`);

    const minDate = Date.now() - MAX_AGE_DAYS * 86400000;
    const seen = new Set();
    const items = [];
    for (const raw of parseXMLFeed(await res.text())) {
        // Algunos medios llegan como URL ("https://fomoera.com/"): se muestra solo el dominio.
        const source = decode(raw.source || '').trim().replace(/^https?:\/\/(www\.)?([^/]+).*$/i, '$2') || 'Prensa';
        // Google agrega " - Medio" al final del titular.
        const fullTitle = decode(raw.title || '').trim();
        const title = (fullTitle.endsWith(` - ${source}`) ? fullTitle.slice(0, -(source.length + 3)) : fullTitle.replace(/\s+-\s+[^-]+$/, '')).trim();
        const date = new Date(raw.pubDate).getTime();
        if (!title || !Number.isFinite(date) || date < minDate) continue;
        if (!terms.some((t) => mentions(title, t)) || isQuotePage(title, source)) continue;
        const key = title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({ title, link: raw.link, source, date, finance: FINANCE_WORDS.test(title), spanish: (title.match(SPANISH_WORDS) ?? []).length >= 2 });
    }

    // Primero las de negocios y mercado, después las escritas en español; dentro de cada grupo, las más nuevas.
    items.sort((a, b) => (b.finance - a.finance) || (b.spanish - a.spanish) || (b.date - a.date));
    return items.slice(0, PER_COMPANY).map(({ finance, spanish, ...item }) => ({ ...item, date: new Date(item.date).toISOString() }));
}
