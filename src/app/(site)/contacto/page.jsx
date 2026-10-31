export const metadata = {
    title: 'Contacto',
    description: 'Ponete en contacto con el equipo de Infopeso.',
    alternates: {
        canonical: 'https://www.infopeso.com.ar/contacto',
    }
};

export default function Page() {
    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            <div className="pulso-container" style={{ maxWidth: '640px', paddingTop: 'var(--space-12)' }}>
                <article className="pulso-card" style={{ padding: 'var(--space-8)' }}>
                    <p className="label" style={{ color: 'var(--signal-text)', marginBottom: 'var(--space-2)' }}>
                        CANAL OFICIAL
                    </p>
                    <h1 className="h1" style={{ color: 'var(--ink)', marginBottom: 'var(--space-4)' }}>
                        Contacto
                    </h1>
                    <p className="body" style={{ color: 'var(--ink-muted)', marginBottom: 'var(--space-6)' }}>
                        ¿Tenés sugerencias, consultas comerciales, comentarios técnicos o encontraste algún error en los datos? Podés comunicarte con nosotros a través de nuestro canal oficial:
                    </p>

                    <div
                        style={{
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--ground-000)',
                            border: '1px solid var(--line)',
                        }}
                    >
                        <h2 className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>
                            X / Twitter oficial
                        </h2>
                        <a
                            href="https://x.com/infopeso"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="data hover:underline"
                            style={{ color: 'var(--signal-text)', fontWeight: 500 }}
                        >
                            @infopeso
                        </a>
                    </div>

                    <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--line)' }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                            Intentamos responder todos los mensajes en un plazo de 24 a 48 horas hábiles.
                        </p>
                    </div>
                </article>
            </div>
        </main>
    );
}
