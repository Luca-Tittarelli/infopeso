'use client';

export default function EmbedCodeBox({ code }) {
    return (
        <div className="space-y-4">
            <textarea
                readOnly
                value={code}
                className="w-full h-24 p-3 rounded-lg text-xs font-mono outline-none resize-none"
                style={{
                    background: 'var(--bg-page)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)'
                }}
                onClick={(e) => e.target.select()}
            />
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                * Haz clic dentro del recuadro para seleccionar todo el código, luego cópialo e insértalo en el editor HTML de tu gestor de contenidos (WordPress, Blogger, Webflow, etc.).
            </p>
        </div>
    );
}
