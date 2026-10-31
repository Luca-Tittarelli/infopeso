import Link from 'next/link';
import { Delta } from '@/components/pulso/Delta';
import { formatNumber } from '@/utils/formatters';
import { BROKERS } from '@/lib/portfolio/importCsv';
import styles from './CarteraLanding.module.css';

// Presentación del gestor de cartera, renderizada en el servidor. Los enlaces #importar, #agregar, #ejemplo y
// #simulador los atiende CarteraApp: cambian de pestaña y abren el panel que corresponde.

const ars = (n) => `$ ${formatNumber(n, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const pct = (n, d = 0) => `${formatNumber(n, { minimumFractionDigits: d, maximumFractionDigits: d })} %`;

// Cartera ilustrativa para la vista previa. Los números son coherentes entre sí (total, MEP, reparto, aviso).
const EJEMPLO = {
    total: 4812300,
    mep: 1550,
    hoyARS: 58900,
    kinds: [
        { label: 'Acciones', weight: 38, color: 'var(--signal)' },
        { label: 'CEDEARs', weight: 27, color: 'var(--down)' },
        { label: 'Bonos', weight: 21, color: 'var(--ink)' },
        { label: 'Efectivo', weight: 14, color: 'var(--line)' },
    ],
    holdings: [
        { symbol: 'GGAL', name: 'Grupo Financiero Galicia', value: 1480000, pct: 2.1 },
        { symbol: 'AAPL', name: 'Apple (CEDEAR)', value: 890400, pct: -0.45 },
        { symbol: 'AL30', name: 'Bono soberano en pesos', value: 760000, pct: 0.8 },
    ],
};

const BROKER_NAMES = BROKERS.filter((b) => b.id !== 'Otro').map((b) => b.label);

function Check() {
    return (
        <svg className={styles.check} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function VistaPrevia() {
    const { total, mep, hoyARS, kinds, holdings } = EJEMPLO;
    const top = holdings[0];
    const topWeight = (top.value / total) * 100;
    return (
        <figure className={`pulso-card-lg ${styles.preview} ${styles.landingOnly}`}>
            <figcaption className="label" style={{ color: 'var(--ink-subtle)' }}>
                Vista previa · Cartera de ejemplo
            </figcaption>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <p className="label" style={{ margin: 0, color: 'var(--ink-muted)' }}>Tu cartera vale</p>
                <p className="figure" style={{ margin: 0 }}>{ars(total)}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="data" style={{ color: 'var(--ink-muted)' }}>
                        US$ {formatNumber(total / mep, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{' '}
                        <span style={{ color: 'var(--ink-subtle)' }}>al dólar MEP</span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <Delta value={(hoyARS / (total - hoyARS)) * 100} pill />
                        <span className="data" style={{ color: 'var(--ink-muted)' }}>+{ars(hoyARS)} hoy</span>
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div className={styles.bar} aria-hidden="true">
                    {kinds.map((k) => (
                        <span key={k.label} style={{ width: `${k.weight}%`, background: k.color }} />
                    ))}
                </div>
                <ul className={`body-sm ${styles.legend}`}>
                    {kinds.map((k) => (
                        <li key={k.label}>
                            <span className={styles.swatch} style={{ background: k.color }} aria-hidden="true" />
                            {k.label} <span className="data" style={{ color: 'var(--ink)' }}>{pct(k.weight)}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.alert}>
                <p className="body-sm" style={{ margin: 0, fontWeight: 700, color: 'var(--ink)' }}>
                    {top.symbol} es el {pct(topWeight)} de tu cartera
                </p>
                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                    Si {top.symbol} cae 10 %, tu cartera baja cerca de {pct(topWeight / 10, 1)}.
                </p>
            </div>

            <ul className={styles.rows}>
                {holdings.map((h) => (
                    <li key={h.symbol} className={styles.row}>
                        <span className={styles.rowName}>
                            <span className="body" style={{ fontWeight: 700, color: 'var(--ink)' }}>{h.symbol}</span>{' '}
                            <span className="body-sm" style={{ color: 'var(--ink-muted)' }}>{h.name}</span>
                        </span>
                        <span className="data" style={{ color: 'var(--ink)' }}>{ars(h.value)}</span>
                        <Delta value={h.pct} compact />
                    </li>
                ))}
            </ul>
        </figure>
    );
}

// Arriba de la app: qué es, para quién y cómo empezar. Para quien ya tiene cartera queda solo el título.
export function CarteraHero() {
    return (
        <header className={`pulso-container ${styles.hero}`}>
            <div className={styles.intro}>
                <p className="label" style={{ color: 'var(--signal-text)', margin: 0 }}>
                    Gestor de cartera · Gratis
                </p>
                <h1 className={`display ${styles.title}`}>Toda tu cartera de inversiones, en pesos y en dólares</h1>
                <p className={`body ${styles.lead} ${styles.landingOnly}`}>
                    Juntá lo que tenés en uno o varios brokers y mirá en un minuto cuánto vale hoy, cuánto se movió y qué está pasando con tus empresas. Acciones, CEDEARs, bonos y efectivo.
                </p>
                <div className={`${styles.ctas} ${styles.landingOnly}`}>
                    <a href="#importar" className="pulso-btn pulso-btn-primary">Cargar mi cartera</a>
                    <a href="#ejemplo" className="pulso-btn pulso-btn-secondary">Ver una cartera de ejemplo</a>
                </div>
                <ul className={`body-sm ${styles.checks} ${styles.landingOnly}`}>
                    <li><Check />Gratis</li>
                    <li><Check />Sin claves ni conexión con tu broker</li>
                    <li><Check />Con o sin cuenta</li>
                </ul>
                <p className={`body-sm ${styles.brokers} ${styles.landingOnly}`}>
                    <span className="label" style={{ color: 'var(--ink-subtle)' }}>Funciona con</span>
                    <span>{BROKER_NAMES.join(' · ')} y cualquier otro broker</span>
                </p>
            </div>
            <VistaPrevia />
        </header>
    );
}

const PASOS = [
    {
        title: 'Traé tu tenencia',
        text: 'Subí el CSV que descargás de tu broker, pegá la tabla que ves en su web o cargá cada activo a mano. Si usás varios brokers, se suman.',
    },
    {
        title: 'Mirá el total',
        text: 'La valuamos con precios de BYMA y el dólar MEP: cuánto vale en pesos y en dólares, y en qué está repartida tu plata.',
    },
    {
        title: 'Volvé cuando quieras',
        text: 'Cada vez que entrás, los precios ya están al día: ves cuánto se movió, los avisos de tu cartera y las noticias de tus empresas.',
    },
];

const PREGUNTAS = [
    {
        tag: 'Total',
        q: '¿Cuánto tengo en total?',
        a: 'Todos tus brokers en un solo número, en pesos y en dólares MEP. Sin planillas ni cuentas a mano.',
    },
    {
        tag: 'Hoy',
        q: '¿Cuánto gané o perdí hoy?',
        a: 'La variación del día de toda tu cartera, en pesos y en porcentaje, y la de cada activo.',
    },
    {
        tag: 'Distribución',
        q: '¿Estoy muy concentrado?',
        a: 'El reparto entre acciones, CEDEARs, bonos y efectivo, y entre pesos y dólares. Si un activo pasa el 30 % de tu cartera, te lo marcamos.',
    },
    {
        tag: 'Avisos',
        q: '¿Qué pasa con mis empresas?',
        a: 'Ves un aviso cuando una presenta resultados en las próximas dos semanas o se mueve fuerte en el día, y las noticias que la mencionan.',
    },
    {
        tag: 'Fundamentals',
        q: '¿Qué dicen los números de mis empresas?',
        a: 'P/E, ROE, dividendos y beta de las empresas que seguimos, ponderados por lo que pesa cada una en tu cartera.',
    },
    {
        tag: 'Probar ideas',
        q: '¿Y si cambio algo?',
        a: 'Armá carteras por porcentajes y mirá cómo cambian los números antes de mover un peso, sin tocar la tuya.',
        href: '#simulador',
        cta: 'Abrir el simulador',
    },
];

const linkStyle = { color: 'var(--signal-text)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '3px' };

// Debajo de la app: cómo funciona, qué resuelve y qué pasa con tus datos. Se oculta para quien ya tiene cartera.
export function CarteraPresentacion() {
    return (
        <div className={`pulso-container ${styles.sections} ${styles.landingOnly}`}>
            <section aria-labelledby="cartera-como-funciona">
                <div className="section-head">
                    <h2 id="cartera-como-funciona" className="h2" style={{ margin: 0 }}>Cómo funciona</h2>
                    <span className="label" style={{ color: 'var(--ink-subtle)' }}>3 pasos · 1 minuto</span>
                </div>
                <ol className={styles.steps}>
                    {PASOS.map((p, i) => (
                        <li key={p.title} className={`pulso-card ${styles.card}`}>
                            <p className={styles.stepNum} aria-hidden="true">{String(i + 1).padStart(2, '0')}</p>
                            <h3 className="body" style={{ margin: 0, fontWeight: 700, color: 'var(--ink)' }}>{p.title}</h3>
                            <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>{p.text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section aria-labelledby="cartera-preguntas">
                <div className="section-head">
                    <h2 id="cartera-preguntas" className="h2" style={{ margin: 0 }}>Lo que vas a poder responder</h2>
                </div>
                <div className={styles.questions}>
                    {PREGUNTAS.map((p) => (
                        <article key={p.q} className={`pulso-card ${styles.card}`}>
                            <span className="source-badge" style={{ alignSelf: 'flex-start' }}>{p.tag}</span>
                            <h3 className="body" style={{ margin: 0, fontWeight: 700, color: 'var(--ink)' }}>{p.q}</h3>
                            <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>{p.a}</p>
                            {p.href && (
                                <a href={p.href} className="body-sm" style={{ ...linkStyle, alignSelf: 'flex-start' }}>{p.cta}</a>
                            )}
                        </article>
                    ))}
                </div>
            </section>

            <section aria-labelledby="cartera-datos">
                <div className="section-head">
                    <h2 id="cartera-datos" className="h2" style={{ margin: 0 }}>Tus datos, bajo tu control</h2>
                </div>
                <div className={styles.split}>
                    <ul className={`body ${styles.checks}`} style={{ flexDirection: 'column', gap: 'var(--space-4)', color: 'var(--ink)' }}>
                        <li style={{ alignItems: 'flex-start' }}>
                            <Check />
                            <span>No te pedimos claves ni conectamos tu cuenta del broker. <span style={{ color: 'var(--ink-muted)' }}>Vos descargás el archivo y decidís qué cargar.</span></span>
                        </li>
                        <li style={{ alignItems: 'flex-start' }}>
                            <Check />
                            <span>El archivo se lee en tu navegador. <span style={{ color: 'var(--ink-muted)' }}>No se sube a ningún servidor: de él solo se guardan tickers, cantidades y montos, en tu navegador o en tu cuenta.</span></span>
                        </li>
                        <li style={{ alignItems: 'flex-start' }}>
                            <Check />
                            <span>No movemos plata ni damos recomendaciones. <span style={{ color: 'var(--ink-muted)' }}>Es una herramienta para entender tu cartera, no para operar.</span></span>
                        </li>
                    </ul>
                    <article className={`pulso-card-lg ${styles.card}`} style={{ gap: 'var(--space-3)' }}>
                        <h3 className="body" style={{ margin: 0, fontWeight: 700, color: 'var(--ink)' }}>Con o sin cuenta</h3>
                        <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                            Sin cuenta, tu cartera queda guardada en este navegador. Con una cuenta gratis la ves desde el celular y la compu, y no se pierde si borrás los datos del navegador.
                        </p>
                        <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                            Si ya cargaste algo sin cuenta, al crearla lo pasamos a tu cuenta.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <Link href="/registro?next=/Cartera" className="pulso-btn pulso-btn-secondary pulso-btn-sm">Crear cuenta gratis</Link>
                            <Link href="/ingresar?next=/Cartera" className="body-sm" style={linkStyle}>Ya tengo cuenta</Link>
                        </div>
                    </article>
                </div>
            </section>

            <section aria-labelledby="cartera-empezar" className={`pulso-card-lg ${styles.closing}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: '56ch' }}>
                    <h2 id="cartera-empezar" className="h2" style={{ margin: 0 }}>Empezá con lo que ya tenés</h2>
                    <p className="body" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                        Cargás tu tenencia una vez y después solo entrás a mirar: los precios se actualizan solos.
                    </p>
                </div>
                <div className={styles.ctas}>
                    <a href="#importar" className="pulso-btn pulso-btn-primary">Cargar mi cartera</a>
                    <a href="#agregar" className="pulso-btn pulso-btn-ghost">Cargar a mano</a>
                </div>
            </section>
        </div>
    );
}
