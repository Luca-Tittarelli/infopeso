import AuthShell, { AuthDisabled } from '@/components/auth/AuthShell';
import { UpdatePasswordForm } from '@/components/auth/AuthForms';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { requireUser } from '@/lib/supabase/dal';

export const metadata = {
    title: 'Nueva contraseña',
    description: 'Elegí una contraseña nueva para tu cuenta de Infopeso.',
    robots: { index: false, follow: false },
};

export default async function Page() {
    if (!isSupabaseConfigured) return <AuthDisabled />;
    await requireUser('/actualizar-clave');

    return (
        <AuthShell eyebrow="CUENTA" title="Nueva contraseña" intro="Elegí la contraseña con la que vas a ingresar de ahora en más.">
            <UpdatePasswordForm />
        </AuthShell>
    );
}
