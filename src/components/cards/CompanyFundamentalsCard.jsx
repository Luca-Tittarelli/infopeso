import React from 'react';

/**
 * A dense, premium card to display company fundamentals.
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

    const { assetProfile, summaryDetail, financialData, defaultKeyStatistics } = data;

    const stats = [
        { label: 'Market Cap', value: summaryDetail?.marketCap?.fmt || '—' },
        { label: 'P/E Ratio', value: summaryDetail?.trailingPE?.fmt || '—' },
        { label: 'Div. Yield', value: summaryDetail?.dividendYield?.fmt || '—' },
        { label: 'Beta (5Y)', value: summaryDetail?.beta?.fmt || '—' },
        { label: 'Revenue', value: financialData?.totalRevenue?.fmt || '—' },
        { label: 'Profit Margin', value: financialData?.profitMargins?.fmt || '—' },
        { label: 'ROE', value: financialData?.returnOnEquity?.fmt || '—' },
        { label: 'EPS (TTM)', value: defaultKeyStatistics?.trailingEps?.fmt || '—' },
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
                        {assetProfile?.sector || 'Sector'} · {assetProfile?.industry || 'Industria'}
                    </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}>
                    {assetProfile?.longName || 'Empresa'}
                </h2>
                <p className="text-xs line-clamp-2 mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {assetProfile?.longBusinessSummary}
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
                        <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}>
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
                        {assetProfile?.city}, {assetProfile?.country}
                    </span>
                </div>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                    Fuente: Yahoo Finance
                </span>
            </div>
        </article>
    );
}
