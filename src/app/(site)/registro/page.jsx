import AuthShell, { AuthDisabled } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/AuthForms';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { safeNext } from '@/lib/supabase/redirect';
import { getEnabledProviders } from '@/lib/supabase/providers';

export const metadata = {
    title: 'Crear cuenta',
    description: 'Creá tu cuenta gratuita de Infopeso y guardá tu cartera de inversiones en la nube.',
    robots: { index: false, follow: false },
};

export default async function Page({ searchParams }) {
    if (!isSupabaseConfigured) return <AuthDisabled />;

    const { next } = await searchParams;
    const safe = typeof next === 'string' ? safeNext(next, '') : '';
    const { google } = await getEnabledProviders();

    return (
        <AuthShell
            eyebrow="CUENTA GRATUITA"
            title="Crear cuenta"
            intro={
                safe.startsWith('/Cartera')
                    ? 'Guardamos el valor de tu cartera cada día para que veas cómo evoluciona en dólares, y accedés desde el celular o la compu. Es gratis y no pedimos claves ni datos bancarios.'
                    : 'Guardá tu cartera en tu cuenta y accedé desde el celular o la compu. Es gratis y no pedimos datos bancarios.'
            }
        >
            <RegisterForm next={safe} google={google} />
        </AuthShell>
    );
}
