import AuthShell, { AuthDisabled, Callout } from '@/components/auth/AuthShell';
import { DeleteAccountForm } from '@/components/auth/AuthForms';
import { Button } from '@/components/pulso/Button';
import { cerrarSesion } from '@/app/actions/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { requireUser } from '@/lib/supabase/dal';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
    title: 'Mi cuenta',
    description: 'Gestioná tu cuenta de Infopeso: datos, contraseña y carteras guardadas.',
    robots: { index: false, follow: false },
};

const PLAN_LABEL = { free: 'Gratis', premium: 'Premium' };

function Row({ label, children }) {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) 0',
                borderBottom: '1px solid var(--line)',
            }}
        >
            <dt className="label" style={{ color: 'var(--ink-subtle)' }}>
                {label}
            </dt>
            <dd className="data" style={{ margin: 0, color: 'var(--ink)' }}>
                {children}
            </dd>
        </div>
    );
}

export default async function Page({ searchParams }) {
    if (!isSupabaseConfigured) return <AuthDisabled />;

    const user = await requireUser('/cuenta');
    const { clave } = await searchParams;

    // RLS limita ambas consultas a las filas del usuario logueado. Si el SQL todavía no se aplicó, se muestra un guion.
    const supabase = await createClient();
    const [profile, items] = await Promise.all([
        supabase.from('profiles').select('display_name, plan').eq('id', user.id).maybeSingle(),
        supabase.from('portfolio_items').select('id', { count: 'exact', head: true }),
    ]);

    const viaGoogle = user.app_metadata?.provider === 'google';
    const name = profile.data?.display_name;
    const plan = PLAN_LABEL[profile.data?.plan] ?? '—';
    const positions = items.error ? '—' : items.count ?? 0;
    const since = new Date(user.created_at).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Argentina/Buenos_Aires',
    });

    return (
        <AuthShell
            eyebrow="MI CUENTA"
            title={name ? `Hola, ${name}` : 'Tu cuenta'}
            intro="Tu cartera se guarda en tu cuenta y está disponible en cualquier dispositivo."
            maxWidth="640px"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {clave === 'actualizada' && <Callout>Tu contraseña se actualizó correctamente.</Callout>}

                <dl style={{ margin: 0, borderTop: '1px solid var(--line)' }}>
                    <Row label="Email">{user.email}</Row>
                    <Row label="Acceso">{viaGoogle ? 'Google' : 'Email y contraseña'}</Row>
                    <Row label="Plan">{plan}</Row>
                    <Row label="Posiciones guardadas">{positions}</Row>
                    <Row label="Miembro desde">{since}</Row>
                </dl>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <Button href="/Cartera">Ir a mi cartera</Button>
                    <Button href="/actualizar-clave" variant="secondary">
                        {viaGoogle ? 'Definir una contraseña' : 'Cambiar contraseña'}
                    </Button>
                    <form action={cerrarSesion}>
                        <Button type="submit" variant="ghost">
                            Cerrar sesión
                        </Button>
                    </form>
                </div>

                <details style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--space-4)' }}>
                    <summary
                        className="body-sm"
                        style={{ cursor: 'pointer', color: 'var(--ink-muted)', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                    >
                        Eliminar mi cuenta
                    </summary>
                    <div style={{ paddingTop: 'var(--space-3)' }}>
                        <DeleteAccountForm />
                    </div>
                </details>
            </div>
        </AuthShell>
    );
}
