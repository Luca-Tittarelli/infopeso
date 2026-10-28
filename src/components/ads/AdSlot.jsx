'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AD_CLIENT, AD_SLOTS } from '@/utils/adsConfig';

const MIN_HEIGHTS = { inContentA: 280, inContentB: 280, sidebar: 600, multiplex: 320 };

// Espacio manual de anuncio. Reserva alto mínimo para no mover el contenido (CLS) y
// no renderiza nada si el bloque todavía no tiene ID configurado.
export default function AdSlot({ slot = 'inContentA', className = '' }) {
    const slotId = AD_SLOTS[slot];
    const pathname = usePathname();
    const pushed = useRef(false);

    useEffect(() => {
        if (!slotId) return;
        pushed.current = false;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushed.current = true;
        } catch {
            // AdSense bloqueado o aún sin cargar: el espacio queda vacío
        }
    }, [slotId, pathname]);

    if (!slotId) return null;

    return (
        <div key={pathname} className={`my-8 ${className}`} style={{ minHeight: MIN_HEIGHTS[slot] }} aria-label="Publicidad">
            <ins
                className="adsbygoogle"
                style={{ display: 'block', minHeight: MIN_HEIGHTS[slot] }}
                data-ad-client={AD_CLIENT}
                data-ad-slot={slotId}
                data-ad-format={slot === 'multiplex' ? 'autorelaxed' : 'auto'}
                data-full-width-responsive="true"
            />
        </div>
    );
}
