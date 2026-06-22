import React from 'react';

/**
 * Formats large numbers (e.g., 1200000 -> 1.2M)
 */
const formatLargeNumber = (num) => {
    if (!num || isNaN(num)) return '—';
    const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
    });
    return formatter.format(num);
};

const formatPercent = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '—';
    return (num * 100).toFixed(2) + '%';
};

/**
 * A dense, premium card to display company fundamentals using FMP data.
 */
export function CompanyFundamentalsCard({ data, status }) {
    if (status === 'loading') {
        return (
            <div className="w-full p-6 rounded-2xl animate-pulse" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="h-4 w-24 bg-gray-700 rounded mb-4"></div>
                <div className="h-8 w-48 bg-gray-700 rounded mb-6"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-gray-700 rounded"></div>
                    <div className="h-12 bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (status === 'error' || !data) {
        return (
            <div className="w-full p-6 rounded-2xl text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--negative)' }}>
                <p className="text-sm font-medium">Error al cargar datos fundamentales.</p>
            </div>
        );
    }

    const { profile, metrics } = data;

    const stats = [
        { label: 'Market Cap', value: formatLargeNumber(profile?.mktCap) },
        { label: 'P/E Ratio', value: metrics?.peRatioTTM?.toFixed(2) || '—' },
        { label: 'Div. Yield', value: formatPercent(metrics?.dividendYieldTTM) },
        { label: 'Beta (5Y)', value: profile?.beta?.toFixed(2) || '—' },
        { label: 'Price/Sales', value: metrics?.priceToSalesRatioTTM?.toFixed(2) || '—' },
        { label: 'ROE', value: formatPercent(metrics?.roeTTM) },
        { label: 'Profit Margin', value: formatPercent(metrics?.netProfitMarginTTM) },
        { label: 'EPS (TTM)', value: metrics?.netIncomePerShareTTM?.toFixed(2) || '—' },
    ];

    return (
        <article 
            className="w-full p-6 rounded-[24px] flex flex-col gap-6 transition-all duration-300 group overflow-hidden relative"
            style={{ 
                background: 'var(--bg-surface)', 
                border: '1px solid var(--border-subtle)',
            }}
        >
            {/* Ambient background effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: 'var(--accent)' }}></div>

            {/* Header: Company Profile */}
            <div className="flex flex-col gap-1 relative z-10">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>
                        {profile?.sector || 'Sector'} · {profile?.industry || 'Industria'}
                    </span>
                    {profile?.image && (
                        <img src={profile.image} alt={profile.companyName} className="w-8 h-8 rounded-lg object-contain bg-white p-1" />
                    )}
                </div>
                <h2 className="text-2xl leading-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                    {profile?.companyName || 'Empresa'}
                </h2>
                <p className="text-xs line-clamp-3 mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {profile?.description}
                </p>
            </div>

            {/* Stats Grid - Bento Style */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                {stats.map((stat, i) => (
                    <div 
                        key={i} 
                        className="p-3 rounded-xl flex flex-col gap-1 transition-transform group-hover:scale-[1.02]" 
                        style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)' }}
                    >
                        <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                            {stat.label}
                        </span>
                        <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {stat.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer / Location */}
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--positive)' }}></div>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        {profile?.city}, {profile?.country} {profile?.exchangeShortName && `· ${profile.exchangeShortName}`}
                    </span>
                </div>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                    Fuente: Financial Modeling Prep
                </span>
            </div>
        </article>
    );
}

