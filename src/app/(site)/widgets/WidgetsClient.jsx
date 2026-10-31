'use client';

export default function EmbedCodeBox({ code }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <textarea
                readOnly
                value={code}
                className="pulso-input data"
                style={{
                    height: '96px',
                    fontSize: '12px',
                    resize: 'none',
                }}
                onClick={(e) => e.target.select()}
            />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                Hacé clic dentro del recuadro para seleccionar todo el código, luego copialo e insertalo en el editor HTML de tu sitio web.
            </p>
        </div>
    );
}
