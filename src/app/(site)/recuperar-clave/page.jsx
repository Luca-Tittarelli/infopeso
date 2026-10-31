import AuthShell, { AuthDisabled } from '@/components/auth/AuthShell';
import { RecoverForm } from '@/components/auth/AuthForms';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const metadata = {
    title: 'Recuperar contraseña',
    description: 'Pedí un enlace para elegir una contraseña nueva en Infopeso.',
    robots: { index: false, follow: false },
};

export default function Page() {
    if (!isSupabaseConfigured) return <AuthDisabled />;

    return (
        <AuthShell
            eyebrow="CUENTA"
            title="Recuperar contraseña"
            intro="Ingresá el email de tu cuenta y te enviamos un enlace para elegir una contraseña nueva."
        >
            <RecoverForm />
        </AuthShell>
    );
}
