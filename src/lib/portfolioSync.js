// Lectura y escritura de la cartera del usuario en Supabase (cliente de navegador; RLS limita todo al dueño).

const SYMBOL_RE = /^[A-Z0-9.^=-]{1,20}$/;

export const PORTFOLIO_STORAGE_KEY = 'infopeso_portfolio';

// Devuelve la cartera por defecto del usuario con sus posiciones ordenadas. La crea si no existe.
export async function loadRemotePortfolio(supabase) {
    const { data, error } = await supabase
        .from('portfolios')
        .select('id, portfolio_items(symbol, weight, position)')
        .eq('is_default', true)
        .maybeSingle();
    if (error) throw error;

    let portfolio = data;
    if (!portfolio) {
        const created = await supabase
            .from('portfolios')
            .insert({ name: 'Mi cartera', kind: 'simulated', is_default: true })
            .select('id')
            .single();
        if (created.error) throw created.error;
        portfolio = { id: created.data.id, portfolio_items: [] };
    }

    const holdings = [...(portfolio.portfolio_items ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((item) => ({ symbol: item.symbol, weight: Number(item.weight) }));

    return { portfolioId: portfolio.id, holdings };
}

// Reemplaza todas las posiciones en una sola llamada atómica (función SQL replace_portfolio_items).
export async function saveRemotePortfolio(supabase, portfolioId, holdings) {
    const items = holdings
        .filter((h) => SYMBOL_RE.test(h.symbol) && Number.isFinite(Number(h.weight)))
        .map((h) => ({ symbol: h.symbol, weight: Number(h.weight) }));

    const { error } = await supabase.rpc('replace_portfolio_items', {
        p_portfolio_id: portfolioId,
        p_items: items,
    });
    if (error) throw error;
}
