'use client';

import { useActionState } from 'react';
import { Button } from '@/components/pulso/Button';
import { Callout } from '@/components/auth/AuthShell';
import { enviarResumenPrueba } from '@/app/actions/resumen';

// Herramienta de prueba para cuentas admin: manda el resumen semanal a la propia casilla.
export default function TestDigestForm() {
    const [state, action, pending] = useActionState(enviarResumenPrueba, undefined);

    return (
        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {state?.error && <Callout role="alert">{state.error}</Callout>}
            {state?.ok && <Callout>{state.ok}</Callout>}
            <div>
                <Button type="submit" variant="secondary" size="sm" loading={pending} loadingText="Enviando…">
                    Enviarme el resumen de prueba
                </Button>
            </div>
        </form>
    );
}
