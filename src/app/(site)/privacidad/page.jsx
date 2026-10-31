export const metadata = {
    title: 'Política de Privacidad',
    description: 'Conocé cómo recopilamos, utilizamos y protegemos tu información en Infopeso.',
    alternates: {
        canonical: 'https://www.infopeso.com.ar/privacidad',
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
                        Política de privacidad
                    </h1>
                    
                    <div className="body-sm" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', color: 'var(--ink-muted)' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                            ACTUALIZADO 31 DE OCTUBRE DE 2026
                        </p>
                        
                        <p style={{ margin: 0 }}>
                            En Infopeso, accesible desde <strong style={{ color: 'var(--ink)' }}>https://www.infopeso.com.ar</strong>, una de nuestras prioridades principales es la privacidad de nuestros visitantes. Este documento de Política de Privacidad describe qué información recopilamos y cómo la utilizamos.
                        </p>

                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 'var(--space-2) 0 0 0' }}>
                            1. Archivos de registro (Log Files)
                        </h2>
                        <p style={{ margin: 0 }}>
                            Infopeso sigue un procedimiento estándar de uso de archivos de registro. La información recopilada incluye direcciones IP, tipo de navegador, proveedor de servicios de Internet (ISP), fecha y hora, y páginas de referencia o salida. Estos datos no están vinculados a ninguna información personalmente identificable y se utilizan únicamente para analizar tendencias y administrar el sitio.
                        </p>

                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 'var(--space-2) 0 0 0' }}>
                            2. Cookies y almacenamiento local
                        </h2>
                        <p style={{ margin: 0 }}>
                            Infopeso utiliza cookies y almacenamiento local (`localStorage`) para recordar tus preferencias de tema visual (modo oscuro o claro) y la cartera de quienes usan el simulador sin cuenta. Si iniciás sesión, usamos además una cookie técnica y necesaria que mantiene tu sesión abierta.
                        </p>

                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 'var(--space-2) 0 0 0' }}>
                            3. Cuentas de usuario y carteras guardadas
                        </h2>
                        <p style={{ margin: 0 }}>
                            Si creás una cuenta, recopilamos tu email, tu contraseña (se almacena cifrada, nunca en texto plano), el nombre que decidas cargar y las carteras que guardes (activos y ponderaciones). Usamos estos datos únicamente para autenticarte, enviarte emails de servicio (confirmación de cuenta y recuperación de contraseña) y mostrarte tu cartera en cualquier dispositivo. No vendemos ni cedemos tus datos a terceros con fines comerciales. Si ingresás con Google, recibimos de Google tu email y tu nombre (nunca tu contraseña de Google) y no accedemos a otros datos de tu cuenta de Google.
                        </p>
                        <p style={{ margin: 0 }}>
                            Los datos de cuenta se almacenan en la infraestructura de Supabase, proveedor de base de datos y autenticación, que puede procesarlos en servidores ubicados fuera de la Argentina. Podés eliminar tu cuenta y todos tus datos en cualquier momento desde la sección Mi cuenta, y solicitar el acceso o la rectificación de tus datos escribiéndonos. Como titular tenés los derechos reconocidos por la Ley N° 25.326 de Protección de los Datos Personales; la Agencia de Acceso a la Información Pública (AAIP) es el órgano de control de esa ley y atiende denuncias y reclamos.
                        </p>

                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 'var(--space-2) 0 0 0' }}>
                            4. Cookie DoubleClick de Google DART
                        </h2>
                        <p style={{ margin: 0 }}>
                            Google es proveedor externo en nuestro sitio y utiliza cookies DART para mostrar anuncios según tu visita a www.infopeso.com.ar y otros sitios en Internet. Podés optar por rechazar el uso de cookies DART visitando la Política de Privacidad de Google en{' '}
                            <a href="https://policies.google.com/technologies/ads" className="underline" style={{ color: 'var(--signal-text)' }} target="_blank" rel="noopener noreferrer">
                                https://policies.google.com/technologies/ads
                            </a>.
                        </p>

                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 'var(--space-2) 0 0 0' }}>
                            5. Socios publicitarios
                        </h2>
                        <p style={{ margin: 0 }}>
                            Nuestro socio publicitario principal es <strong style={{ color: 'var(--ink)' }}>Google AdSense</strong>, el cual cuenta con su propia Política de Privacidad para el tratamiento de datos.
                        </p>

                        <h2 className="h2" style={{ color: 'var(--ink)', margin: 'var(--space-2) 0 0 0' }}>
                            6. Consentimiento y contacto
                        </h2>
                        <p style={{ margin: 0 }}>
                            Al utilizar nuestro sitio web, aceptás nuestra Política de Privacidad y nuestros Términos de Servicio. Si tenés preguntas adicionales, podés escribirnos en X a{' '}
                            <a href="https://x.com/infopeso" className="underline" style={{ color: 'var(--signal-text)' }} target="_blank" rel="noopener noreferrer">
                                @infopeso
                            </a>.
                        </p>
                    </div>
                </article>
            </div>
        </main>
    );
}
