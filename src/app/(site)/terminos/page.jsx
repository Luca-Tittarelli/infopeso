export const metadata = {
    title: 'Términos de Servicio',
    description: 'Términos y condiciones de uso de la plataforma Infopeso.',
    alternates: {
        canonical: 'https://www.infopeso.com.ar/terminos',
    }
};

export default function Page() {
    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            <div className="pulso-container" style={{ maxWidth: '840px', paddingTop: 'var(--space-12)' }}>
                <article className="pulso-card" style={{ padding: 'var(--space-8)' }}>
                    <p className="label" style={{ color: 'var(--signal-text)', marginBottom: 'var(--space-2)' }}>
                        DOCUMENTACIÓN LEGAL
                    </p>
                    <h1 className="h1" style={{ color: 'var(--ink)', marginBottom: 'var(--space-6)' }}>
                        Términos de servicio
                    </h1>
                    
                    <div className="body-sm" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', color: 'var(--ink-muted)' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                            ACTUALIZADO 31 DE OCTUBRE DE 2026
                        </p>
                        
                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 'var(--space-2) 0 0 0' }}>
                            1. Aceptación de los términos
                        </h2>
                        <p style={{ margin: 0 }}>
                            Al acceder y utilizar el sitio web <strong style={{ color: 'var(--ink)' }}>https://www.infopeso.com.ar</strong> ("Infopeso"), aceptás quedar vinculado por estos Términos de Servicio y todas las leyes y regulaciones aplicables en la República Argentina.
                        </p>

                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 'var(--space-2) 0 0 0' }}>
                            2. Exclusión de responsabilidad (Disclaimer)
                        </h2>
                        <p style={{ margin: 0 }}>
                            Los materiales y la información en Infopeso se proporcionan tal cual se publican en sus fuentes originales.
                        </p>
                        <p
                            style={{
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--surface-200)',
                                border: '1px solid var(--line)',
                                color: 'var(--ink)',
                                fontWeight: 600,
                                margin: 0,
                            }}
                        >
                            Información con fines informativos. No es una recomendación de inversión. El contenido y las herramientas de Infopeso son exclusivamente informativos y educativos, y no constituyen asesoramiento financiero, recomendación de inversión ni oferta de compra o venta de activos. Consultá siempre con un asesor financiero matriculado ante la CNV antes de tomar cualquier decisión de inversión.
                        </p>

                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 'var(--space-2) 0 0 0' }}>
                            3. Fuentes de datos y exactitud
                        </h2>
                        <p style={{ margin: 0 }}>
                            Infopeso recopila información financiera pública en tiempo real de diversas fuentes externas (como el Banco Central de la República Argentina, DolarAPI, ArgentinaDatos y TradingView). No garantizamos la exactitud, integridad o puntualidad de los datos mostrados y no nos responsabilizamos por pérdidas o daños derivados del uso de la información del sitio.
                        </p>

                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 'var(--space-2) 0 0 0' }}>
                            4. Cuentas de usuario
                        </h2>
                        <p style={{ margin: 0 }}>
                            Podés usar Infopeso sin registrarte. Si creás una cuenta, sos responsable de mantener la confidencialidad de tu contraseña y de la actividad que se realice con ella. Podemos suspender o eliminar cuentas que se usen de forma abusiva o para vulnerar el sitio. Podés eliminar tu cuenta cuando quieras desde la sección Mi cuenta. Las funciones asociadas a la cuenta pueden modificarse o incorporar planes pagos en el futuro, con aviso previo.
                        </p>

                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 'var(--space-2) 0 0 0' }}>
                            5. Ley aplicable
                        </h2>
                        <p style={{ margin: 0 }}>
                            Cualquier controversia relacionada con Infopeso se regirá por las leyes de la República Argentina.
                        </p>
                    </div>
                </article>
            </div>
        </main>
    );
}
