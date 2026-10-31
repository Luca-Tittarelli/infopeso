import AuthShell, { Callout } from '@/components/auth/AuthShell';
import { Button } from '@/components/pulso/Button';
import { confirmarBaja } from '@/app/actions/resumen';
import { verifyUnsubscribe } from '@/lib/email/unsubscribe';

export const metadata = {
    title: 'Baja del resumen semanal',
    description: 'Dejá de recibir el resumen semanal de tu cartera de Infopeso.',
    robots: { index: false, follow: false },
};

// El botón envía un formulario por POST: abrir el link (o que un antivirus lo previsualice) no da de baja a nadie.
export default async function Page({ searchParams }) {
    const { u, t, listo, error } = await searchParams;

    if (listo) {
        return (
            <AuthShell eyebrow="RESUMEN SEMANAL" title="Listo, no vas a recibir más el resumen" intro="Podés volver a activarlo cuando quieras desde Mi cuenta.">
                <Button href="/Cartera">Ir a mi cartera</Button>
            </AuthShell>
        );
    }

    const valid = !error && verifyUnsubscribe(u, t);
    if (!valid) {
        return (
            <AuthShell eyebrow="RESUMEN SEMANAL" title="Este link no es válido" intro="Si querés dejar de recibir el resumen, ingresá a tu cuenta y apagalo desde ahí.">
                {error && <Callout role="alert">No pudimos procesar la baja. Probá de nuevo desde Mi cuenta.</Callout>}
                <div style={{ marginTop: 'var(--space-4)' }}>
                    <Button href="/cuenta">Ir a Mi cuenta</Button>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell eyebrow="RESUMEN SEMANAL" title="¿Dejar de recibir el resumen?" intro="Cada viernes te mandamos cuánto rindió tu cartera y qué activo se movió más. Si confirmás, dejamos de enviarlo.">
            <form action={confirmarBaja} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <input type="hidden" name="u" value={u} />
                <input type="hidden" name="t" value={t} />
                <Button type="submit">Confirmar baja</Button>
                <Button href="/Cartera" variant="secondary">Mejor no</Button>
            </form>
        </AuthShell>
    );
}
