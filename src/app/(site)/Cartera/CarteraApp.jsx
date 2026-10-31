'use client';

import { useEffect, useState } from 'react';
import CarteraReal from './CarteraReal';
import CarteraClient from './CarteraClient';
import { track } from '@/lib/track';

const TABS = [
    { id: 'real', label: 'Mi cartera' },
    { id: 'sim', label: 'Probar ideas' },
];

// Enlaces de la presentación (CarteraLanding) y de afuera, como /Cartera#importar.
const INTENTS = ['importar', 'agregar', 'ejemplo'];

// Dos vistas: "Mi cartera" (lo que tenés, con cantidades y precios) y "Probar ideas" (simulador por porcentajes).
export default function CarteraApp() {
    const [tab, setTab] = useState('real');
    const [intent, setIntent] = useState(null);

    useEffect(() => {
        function onHash() {
            const hash = window.location.hash.slice(1);
            if (hash !== 'simulador' && !INTENTS.includes(hash)) return;
            setTab(hash === 'simulador' ? 'sim' : 'real');
            setIntent(hash === 'simulador' ? null : { type: hash });
            if (hash === 'ejemplo') track('demo_view');
            // Sin el hash en la URL, el mismo enlace vuelve a funcionar en el próximo clic.
            history.replaceState(history.state, '', window.location.pathname + window.location.search);
            document.getElementById('cartera-app')?.scrollIntoView({ block: 'start' });
        }
        onHash();
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);

    // Al cambiar de pestaña a mano se descarta el enlace pendiente: volver a "Mi cartera" no reabre el panel.
    function selectTab(id) {
        setTab(id);
        setIntent(null);
    }

    function onKeyDown(e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const i = TABS.findIndex((t) => t.id === tab);
        const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
        selectTab(next.id);
        document.getElementById(`tab-${next.id}`)?.focus();
    }

    return (
        <>
            <div id="cartera-app" className="pulso-container" style={{ paddingBottom: 'var(--space-4)', scrollMarginTop: '80px' }}>
                <div role="tablist" aria-label="Vistas de la cartera" onKeyDown={onKeyDown} className="flex flex-wrap gap-2">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            id={`tab-${t.id}`}
                            type="button"
                            role="tab"
                            aria-selected={tab === t.id}
                            aria-controls="cartera-panel"
                            tabIndex={tab === t.id ? 0 : -1}
                            className={tab === t.id ? 'pill-active' : 'pill-inactive'}
                            style={{ minHeight: '44px' }}
                            onClick={() => selectTab(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
            <div id="cartera-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
                {tab === 'real' ? <CarteraReal intent={intent} /> : <CarteraClient />}
            </div>
        </>
    );
}
