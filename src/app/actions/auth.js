'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { requireUser } from '@/lib/supabase/dal';
import { safeNext } from '@/lib/supabase/redirect';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72; // límite de bcrypt, que es lo que usa Supabase por debajo

const NOT_CONFIGURED = 'Las cuentas todavía no están habilitadas en este sitio.';
const GENERIC_ERROR = 'No pudimos completar la operación. Probá de nuevo en unos minutos.';

const text = (formData, key) => String(formData.get(key) ?? '').trim();

// Mensajes en castellano para los códigos de error de Supabase Auth.
function friendlyError(error) {
    switch (error?.code) {
        case 'invalid_credentials':
            return 'El email o la contraseña no son correctos.';
        case 'email_not_confirmed':
            return 'Todavía no confirmaste tu email. Revisá tu bandeja de entrada y la carpeta de spam.';
        case 'over_request_rate_limit':
        case 'over_email_send_rate_limit':
            return 'Hiciste demasiados intentos. Esperá unos minutos y probá de nuevo.';
        case 'weak_password':
            return 'La contraseña es demasiado débil. Usá al menos 8 caracteres combinando letras y números.';
        case 'same_password':
            return 'La nueva contraseña tiene que ser distinta de la actual.';
        case 'signup_disabled':
            return 'El registro está deshabilitado por el momento.';
        default:
            return GENERIC_ERROR;
    }
}

function validatePassword(password) {
    if (password.length < PASSWORD_MIN) return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`;
    if (password.length > PASSWORD_MAX) return `La contraseña no puede superar los ${PASSWORD_MAX} caracteres.`;
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'La contraseña debe combinar letras y números.';
    return null;
}

// Los enlaces de los emails vuelven a este mismo origen (debe estar en las Redirect URLs de Supabase).
async function getOrigin() {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
}

export async function iniciarSesion(_prev, formData) {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

    const email = text(formData, 'email').toLowerCase();
    const password = String(formData.get('password') ?? '');
    const next = safeNext(text(formData, 'next'));

    if (!EMAIL_RE.test(email) || !password) {
        return { error: 'Ingresá tu email y tu contraseña.', email };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: friendlyError(error), email };

    redirect(next);
}

// Login con Google (OAuth con PKCE). Supabase devuelve la URL de Google; al volver, /auth/confirm
// canjea el código por la sesión. Alta y login son el mismo paso: si la cuenta no existe se crea.
export async function iniciarConGoogle(formData) {
    if (!isSupabaseConfigured) redirect('/ingresar');

    const next = safeNext(text(formData, 'next'));
    const supabase = await createClient();
    const origin = await getOrigin();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
            queryParams: { prompt: 'select_account' },
        },
    });
    if (error || !data?.url) redirect('/ingresar?error=google');

    redirect(data.url);
}

export async function registrarse(_prev, formData) {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

    const name = text(formData, 'name').slice(0, 80);
    const email = text(formData, 'email').toLowerCase();
    const password = String(formData.get('password') ?? '');
    const accepted = formData.get('terms') === 'on';
    const next = safeNext(text(formData, 'next'));

    if (!EMAIL_RE.test(email)) return { error: 'Ingresá un email válido.', email, name };
    const passwordError = validatePassword(password);
    if (passwordError) return { error: passwordError, email, name };
    if (!accepted) {
        return { error: 'Tenés que aceptar los términos y la política de privacidad para crear la cuenta.', email, name };
    }

    const supabase = await createClient();
    const origin = await getOrigin();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: name ? { full_name: name } : {},
            emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
        },
    });
    if (error) return { error: friendlyError(error), email, name };

    // Si el proyecto no exige confirmar el email, la sesión ya existe.
    if (data.session) redirect(next);

    // Con un email ya registrado Supabase no da error (evita revelar qué emails existen): el mensaje es el mismo.
    return { sent: true, email };
}

export async function recuperarClave(_prev, formData) {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

    const email = text(formData, 'email').toLowerCase();
    if (!EMAIL_RE.test(email)) return { error: 'Ingresá un email válido.', email };

    const supabase = await createClient();
    const origin = await getOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent('/actualizar-clave')}`,
    });
    if (error && error.code !== 'user_not_found') return { error: friendlyError(error), email };

    // Misma respuesta exista o no la cuenta.
    return { sent: true, email };
}

export async function actualizarClave(_prev, formData) {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

    const password = String(formData.get('password') ?? '');
    const confirm = String(formData.get('confirm') ?? '');

    const passwordError = validatePassword(password);
    if (passwordError) return { error: passwordError };
    if (password !== confirm) return { error: 'Las contraseñas no coinciden.' };

    await requireUser('/actualizar-clave');
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: friendlyError(error) };

    redirect('/cuenta?clave=actualizada');
}

export async function cerrarSesion() {
    if (isSupabaseConfigured) {
        const supabase = await createClient();
        // 'local' cierra solo este dispositivo; el valor por defecto ('global') cerraría todas las sesiones.
        await supabase.auth.signOut({ scope: 'local' });
    }
    redirect('/');
}

// Ley 25.326: el titular puede pedir la supresión de sus datos. La función SQL delete_my_account()
// borra el usuario y, por cascada, su perfil y sus carteras.
export async function eliminarCuenta(_prev, formData) {
    if (text(formData, 'confirm') !== 'ELIMINAR') {
        return { error: 'Escribí ELIMINAR en mayúsculas para confirmar.' };
    }

    await requireUser('/cuenta');
    const supabase = await createClient();
    const { error } = await supabase.rpc('delete_my_account');
    if (error) return { error: GENERIC_ERROR };

    await supabase.auth.signOut({ scope: 'local' });
    redirect('/');
}
