import React, { useState, useEffect } from 'react';

const INITIAL_COMMODITIES = [
    { id: 'soja',  label: 'Soja Chicago', value: 432.50, unit: 'USD/tn', delta: 1.2,  base: 432.50 },
    { id: 'maiz',  label: 'Maíz Chicago', value: 178.20, unit: 'USD/tn', delta: -0.5, base: 178.20 },
    { id: 'trigo', label: 'Trigo Chicago', value: 224.15, unit: 'USD/tn', delta: 0.8,  base: 224.15 },
    { id: 'oil',   label: 'Petróleo WTI', value: 78.45,  unit: 'USD/bbl', delta: 0.3,  base: 78.45 },
    { id: 'oro',   label: 'Oro Spot',     value: 2315.40, unit: 'USD/oz', delta: -0.1, base: 2315.40 },
    { id: 'plata', label: 'Plata Spot',   value: 27.25,   unit: 'USD/oz', delta: 1.5,  base: 27.25 },
];

export function CommodityTicker() {
    const [commodities, setCommodities] = useState(INITIAL_COMMODITIES);

    useEffect(() => {
        const interval = setInterval(() => {
            setCommodities(prev => prev.map(c => {
                const change = (Math.random() - 0.5) * (c.value * 0.0005); // Mini variaciones
                const newVal = c.value + change;
                const newDelta = ((newVal - c.base) / c.base) * 100;
                return { ...c, value: newVal, delta: newDelta };
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative overflow-hidden rounded-xl py-3" 
             style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <div className="flex animate-ticker whitespace-nowrap">
                {[...commodities, ...commodities].map((c, i) => (
                    <div key={i} className="inline-flex items-center gap-2 px-8 border-r last:border-0"
                         style={{ borderColor: 'var(--border-subtle)' }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider" 
                              style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-ui)' }}>
                            {c.label}
                        </span>
                        <span className="text-sm font-medium tabular-nums" 
                              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {c.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            {c.unit}
                        </span>
                        <span className={`text-[10px] font-bold tabular-nums ${c.delta > 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                            {c.delta > 0 ? '↑' : '↓'} {Math.abs(c.delta).toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
