import AuthShell, { AuthDisabled } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/AuthForms';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { safeNext } from '@/lib/supabase/redirect';
import { getEnabledProviders } from '@/lib/supabase/providers';

export const metadata = {
    title: 'Ingresar',
    description: 'Ingresá a tu cuenta de Infopeso para ver tu cartera en cualquier dispositivo.',
    robots: { index: false, follow: false },
};

export default async function Page({ searchParams }) {
    if (!isSupabaseConfigured) return <AuthDisabled />;

    const { next, error } = await searchParams;
    const safe = typeof next === 'string' ? safeNext(next, '') : '';
    const { google } = await getEnabledProviders();
    const notice =
        error === 'enlace'
            ? 'El enlace venció o ya se usó. Pedí uno nuevo desde "Olvidé mi contraseña" o volvé a registrarte.'
            : error === 'google'
            ? 'No pudimos completar el ingreso con Google. Probá de nuevo o ingresá con tu email.'
            : null;

    return (
        <AuthShell
            eyebrow="CUENTA"
            title="Ingresar"
            intro="Entrá para guardar tu cartera y verla en cualquier dispositivo."
        >
            <LoginForm next={safe} notice={notice} google={google} />
        </AuthShell>
    );
}
