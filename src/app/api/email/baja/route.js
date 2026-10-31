import { NextResponse } from 'next/server';
import { unsubscribeUser } from '@/lib/email/unsubscribe';

// Baja en un clic desde Gmail y otros clientes (cabecera List-Unsubscribe-Post): llegan por POST con el link firmado.
// GET no hace nada a propósito: los antivirus y previsualizadores abren los links y darían de baja a todos.
export async function POST(request) {
    const { searchParams } = new URL(request.url);
    const ok = await unsubscribeUser(searchParams.get('u'), searchParams.get('t'));
    return new NextResponse(null, { status: ok ? 204 : 400, headers: { 'Cache-Control': 'no-store' } });
}
