'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/pulso/Button';
import { Callout } from '@/components/auth/AuthShell';
import {
    iniciarSesion,
    iniciarConGoogle,
    registrarse,
    recuperarClave,
    actualizarClave,
    eliminarCuenta,
} from '@/app/actions/auth';

const formStyle = { display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' };

const linkStyle = {
    color: 'var(--signal-text)',
    fontWeight: 500,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
};

function Field({ id, label, hint, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label htmlFor={id} className="label" style={{ color: 'var(--ink-muted)' }}>
                {label}
            </label>
            {children}
            {hint && (
                <p className="body-sm" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                    {hint}
                </p>
            )}
        </div>
    );
}

function Sent({ title, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h2 className="h2" style={{ margin: 0 }}>
                {title}
            </h2>
            <p className="body" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                {children}
            </p>
        </div>
    );
}

// Logo oficial de Google: sus lineamientos piden conservar los cuatro colores en el botón de acceso.
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
);

function GoogleSubmit() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="pulso-btn pulso-btn-secondary" style={{ width: '100%' }}>
            <GoogleIcon />
            {pending ? 'Redirigiendo…' : 'Continuar con Google'}
        </button>
    );
}

// Botón de Google + aviso legal + separador. Va fuera del <form> de email (no se pueden anidar formularios).
function GoogleButton({ next }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <form action={iniciarConGoogle}>
                <input type="hidden" name="next" value={next ?? ''} />
                <GoogleSubmit />
            </form>
            <p className="body-sm" style={{ margin: 0, color: 'var(--ink-subtle)' }}>
                Al continuar con Google aceptás los{' '}
                <Link href="/terminos" target="_blank" style={linkStyle}>
                    términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link href="/privacidad" target="_blank" style={linkStyle}>
                    política de privacidad
                </Link>
                .
            </p>
            <div
                role="separator"
                className="label"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--ink-subtle)' }}
            >
                <span style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
                o con tu email
                <span style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
            </div>
        </div>
    );
}

export function LoginForm({ next, notice, google = false }) {
    const [state, action, pending] = useActionState(iniciarSesion, undefined);
    const withNext = next ? `?next=${encodeURIComponent(next)}` : '';

    return (
        <div style={formStyle}>
            {notice && <Callout>{notice}</Callout>}
            {google && <GoogleButton next={next} />}

            <form action={action} style={formStyle}>
                <input type="hidden" name="next" value={next ?? ''} />
                {state?.error && <Callout role="alert">{state.error}</Callout>}

                <Field id="email" label="Email">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        defaultValue={state?.email ?? ''}
                        className="pulso-input"
                    />
                </Field>

                <Field id="password" label="Contraseña">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        className="pulso-input"
                    />
                </Field>

                <Button type="submit" loading={pending} loadingText="Ingresando…">
                    Ingresar
                </Button>

                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                    <Link href="/recuperar-clave" style={linkStyle}>
                        Olvidé mi contraseña
                    </Link>
                    {' · '}
                    <Link href={`/registro${withNext}`} style={linkStyle}>
                        Crear una cuenta
                    </Link>
                </p>
            </form>
        </div>
    );
}

export function RegisterForm({ next, google = false }) {
    const [state, action, pending] = useActionState(registrarse, undefined);

    if (state?.sent) {
        return (
            <Sent title="Revisá tu email">
                Te enviamos un enlace de confirmación a {state.email}. Abrilo para activar tu cuenta. Si no lo
                ves en unos minutos, mirá la carpeta de spam o volvé a registrarte con el mismo email.
            </Sent>
        );
    }

    return (
        <div style={formStyle}>
            {google && <GoogleButton next={next} />}

            <form action={action} style={formStyle}>
                <input type="hidden" name="next" value={next ?? ''} />
                {state?.error && <Callout role="alert">{state.error}</Callout>}

                <Field id="name" label="Nombre (opcional)">
                    <input
                        id="name"
                        name="name"
                        type="text"
                        maxLength={80}
                        autoComplete="name"
                        defaultValue={state?.name ?? ''}
                        className="pulso-input"
                    />
                </Field>

                <Field id="email" label="Email">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        defaultValue={state?.email ?? ''}
                        className="pulso-input"
                    />
                </Field>

                <Field id="password" label="Contraseña" hint="Mínimo 8 caracteres, combinando letras y números.">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        maxLength={72}
                        autoComplete="new-password"
                        className="pulso-input"
                    />
                </Field>

                <label
                    htmlFor="terms"
                    className="body-sm"
                    style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', color: 'var(--ink-muted)' }}
                >
                    <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        style={{ width: '20px', height: '20px', marginTop: '2px', flexShrink: 0, accentColor: 'var(--signal)' }}
                    />
                    <span>
                        Acepto los{' '}
                        <Link href="/terminos" target="_blank" style={linkStyle}>
                            términos y condiciones
                        </Link>{' '}
                        y la{' '}
                        <Link href="/privacidad" target="_blank" style={linkStyle}>
                            política de privacidad
                        </Link>
                        .
                    </span>
                </label>

                <Button type="submit" loading={pending} loadingText="Creando cuenta…">
                    Crear cuenta
                </Button>

                <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                    ¿Ya tenés cuenta?{' '}
                    <Link href={next ? `/ingresar?next=${encodeURIComponent(next)}` : '/ingresar'} style={linkStyle}>
                        Ingresar
                    </Link>
                </p>
            </form>
        </div>
    );
}

export function RecoverForm() {
    const [state, action, pending] = useActionState(recuperarClave, undefined);

    if (state?.sent) {
        return (
            <Sent title="Revisá tu email">
                Si {state.email} tiene una cuenta en Infopeso, te enviamos un enlace para elegir una contraseña
                nueva. El enlace vence en una hora.
            </Sent>
        );
    }

    return (
        <form action={action} style={formStyle}>
            {state?.error && <Callout role="alert">{state.error}</Callout>}

            <Field id="email" label="Email">
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    defaultValue={state?.email ?? ''}
                    className="pulso-input"
                />
            </Field>

            <Button type="submit" loading={pending} loadingText="Enviando…">
                Enviar enlace
            </Button>

            <p className="body-sm" style={{ margin: 0 }}>
                <Link href="/ingresar" style={linkStyle}>
                    Volver a ingresar
                </Link>
            </p>
        </form>
    );
}

export function UpdatePasswordForm() {
    const [state, action, pending] = useActionState(actualizarClave, undefined);

    return (
        <form action={action} style={formStyle}>
            {state?.error && <Callout role="alert">{state.error}</Callout>}

            <Field id="password" label="Contraseña nueva" hint="Mínimo 8 caracteres, combinando letras y números.">
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    className="pulso-input"
                />
            </Field>

            <Field id="confirm" label="Repetí la contraseña">
                <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    className="pulso-input"
                />
            </Field>

            <Button type="submit" loading={pending} loadingText="Guardando…">
                Guardar contraseña
            </Button>
        </form>
    );
}

export function DeleteAccountForm() {
    const [state, action, pending] = useActionState(eliminarCuenta, undefined);

    return (
        <form action={action} style={formStyle}>
            {state?.error && <Callout role="alert">{state.error}</Callout>}

            <Field
                id="confirm"
                label="Para confirmar, escribí ELIMINAR"
                hint="Se borran tu cuenta, tu perfil y tus carteras guardadas. No se puede deshacer."
            >
                <input
                    id="confirm"
                    name="confirm"
                    type="text"
                    required
                    autoComplete="off"
                    autoCapitalize="characters"
                    className="pulso-input"
                />
            </Field>

            <Button type="submit" variant="secondary" loading={pending} loadingText="Eliminando…">
                Eliminar mi cuenta
            </Button>
        </form>
    );
}
