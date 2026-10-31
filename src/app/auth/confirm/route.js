import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { safeNext } from '@/lib/supabase/redirect';

const OTP_TYPES = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'];

// Destino de los enlaces de los emails de Supabase (confirmar cuenta y recuperar contraseña).
// Acepta el formato token_hash (recomendado: funciona desde cualquier dispositivo)
// y el formato code (PKCE: solo funciona en el mismo navegador donde se pidió).
export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const code = searchParams.get('code');
    const next = safeNext(searchParams.get('next'), type === 'recovery' ? '/actualizar-clave' : '/cuenta');

    if (!isSupabaseConfigured) return NextResponse.redirect(new URL('/', origin));

    // Google devuelve ?error=... si el usuario cancela o rechaza el permiso.
    if (searchParams.get('error')) return NextResponse.redirect(new URL('/ingresar?error=google', origin));

    const supabase = await createClient();
    let error = new Error('Faltan parámetros en el enlace');

    if (tokenHash && OTP_TYPES.includes(type)) {
        ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
    } else if (code) {
        ({ error } = await supabase.auth.exchangeCodeForSession(code));
    }

    if (error) return NextResponse.redirect(new URL('/ingresar?error=enlace', origin));
    return NextResponse.redirect(new URL(next, origin));
}
