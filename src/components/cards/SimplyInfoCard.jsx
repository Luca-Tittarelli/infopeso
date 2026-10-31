import { QuoteCard } from '@/components/pulso/QuoteCard';

export function SimplyCard({ titulo, valor = null, valorAnterior = null, fecha, isMonthly }) {
    const hasVal = valor !== null && valor !== undefined && Number(valor) !== 0;
    const hasPrev = valorAnterior !== null && valorAnterior !== undefined && Number(valorAnterior) !== 0;
    const difference = hasVal && hasPrev ? ((Number(valor) - Number(valorAnterior)) / Math.abs(Number(valorAnterior))) * 100 : null;

    return (
        <QuoteCard
            label={`${titulo} · ${isMonthly ? 'MENSUAL' : 'HOY'}`}
            value={valor}
            delta={difference}
            deltaUnit="%"
            updatedAt={fecha}
        />
    );
}
