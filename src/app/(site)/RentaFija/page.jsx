import RentaFijaClient from './RentaFijaClient';
import Link from 'next/link';
import { BOND_DATA, calculateBondMetrics } from '@/utils/bondCalculator';
import { getBondPricing } from '@/lib/market';

export const metadata = {
    title: 'Cotizaciones de Renta Fija — Bonos y Obligaciones Negociables',
    description: 'Cotizaciones en tiempo real y calculadora de TIR (XIRR) de Bonos Soberanos de Argentina (AL30, GD30, CER) y Obligaciones Negociables (ONs).',
    openGraph: {
        title: 'Cotizaciones de Renta Fija — Bonos y Obligaciones Negociables',
        description: 'Cotizaciones en tiempo real y calculadora de TIR (XIRR) de Bonos Soberanos de Argentina (AL30, GD30, CER) y Obligaciones Negociables (ONs).',
        url: 'https://www.infopeso.com.ar/RentaFija',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://www.infopeso.com.ar/logo.png' }],
    },
    alternates: {
        canonical: 'https://www.infopeso.com.ar/RentaFija',
    }
};

export default async function Page() {
    const ids = Object.keys(BOND_DATA);
    const pricings = await Promise.all(ids.map((id) => getBondPricing(id)));

    return (
        <>
            <RentaFijaClient />
            <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-12">
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                    Bonos soberanos en dólares: precio, TIR y paridad
                </h2>
                <div className="overflow-x-auto rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <table className="w-full text-sm text-left">
                        <thead style={{ color: 'var(--text-tertiary)' }}>
                            <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                                <th className="p-3">Bono</th>
                                <th className="p-3 text-right">Precio ARS</th>
                                <th className="p-3 text-right">USD (MEP)</th>
                                <th className="p-3 text-right">TIR</th>
                                <th className="p-3 text-right">Paridad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ids.map((id, i) => {
                                const p = pricings[i];
                                const m = p?.usdMep ? calculateBondMetrics(id, p.usdMep) : null;
                                return (
                                    <tr key={id} className="border-b" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                        <td className="p-3"><Link href={`/RentaFija/${id}`} className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>{id}</Link> <span className="text-xs">{BOND_DATA[id].fullName}</span></td>
                                        <td className="p-3 text-right font-mono">{p?.ars ? `$${p.ars.toLocaleString('es-AR')}` : '—'}</td>
                                        <td className="p-3 text-right font-mono">{p?.usdMep ? p.usdMep.toLocaleString('es-AR') : '—'}</td>
                                        <td className="p-3 text-right font-mono">{m ? `${m.tir}%` : '—'}</td>
                                        <td className="p-3 text-right font-mono">{m ? `${m.paridad}%` : '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>Precios por 100 VN (BYMA vía data912). TIR y paridad son estimaciones informativas.</p>
            </section>
        </>
    );
}
