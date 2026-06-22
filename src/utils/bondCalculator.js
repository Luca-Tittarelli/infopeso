/**
 * Calculates the XIRR (Internal Rate of Return for irregular cash flows)
 * @param {Array} cashFlows - Array of objects { date: Date, amount: number }
 * @param {number} guess - Initial guess for the rate (default 0.1)
 * @returns {number} The calculated TIR (as a decimal, e.g., 0.15 for 15%)
 */
export function calculateXIRR(cashFlows, guess = 0.1) {
    if (!cashFlows || cashFlows.length < 2) return 0;
    
    // Check if we have both positive and negative flows
    let hasPositive = false;
    let hasNegative = false;
    for (const cf of cashFlows) {
        if (cf.amount > 0) hasPositive = true;
        if (cf.amount < 0) hasNegative = true;
    }
    if (!hasPositive || !hasNegative) return 0;

    const maxIter = 100;
    const tolerance = 1e-6;
    let rate = guess;

    const xnpv = (r) => {
        let npv = 0;
        const t0 = cashFlows[0].date.getTime();
        for (const cf of cashFlows) {
            const t = cf.date.getTime();
            const days = (t - t0) / (1000 * 3600 * 24);
            npv += cf.amount / Math.pow(1 + r, days / 365.0);
        }
        return npv;
    };

    const xnpvDerivative = (r) => {
        let dnpv = 0;
        const t0 = cashFlows[0].date.getTime();
        for (const cf of cashFlows) {
            const t = cf.date.getTime();
            const days = (t - t0) / (1000 * 3600 * 24);
            if (days > 0) {
                dnpv -= (days / 365.0) * cf.amount / Math.pow(1 + r, (days / 365.0) + 1);
            }
        }
        return dnpv;
    };

    for (let i = 0; i < maxIter; i++) {
        const f = xnpv(rate);
        if (Math.abs(f) < tolerance) return rate;
        
        const df = xnpvDerivative(rate);
        if (df === 0) break; // prevent division by zero
        
        const newRate = rate - f / df;
        if (Math.abs(newRate - rate) < tolerance) return newRate;
        rate = newRate;
    }

    return rate;
}

/**
 * Approximate remaining cash flows per 100 VNO (Valores Nominales Originales)
 * Data updated for 2026 onwards for the most popular bonds.
 */
export const BOND_DATA = {
    "AL30": {
        name: "AL30 - Ley Argentina 2030",
        residualValue: 84.0, // Approximate remaining principal in mid 2026
        flows: [
            { date: "2026-07-09", amount: 4.375 },
            { date: "2027-01-09", amount: 4.375 },
            { date: "2027-07-09", amount: 4.375 },
            { date: "2028-01-09", amount: 16.75 },
            { date: "2028-07-09", amount: 16.75 },
            { date: "2029-01-09", amount: 16.75 },
            { date: "2029-07-09", amount: 16.75 },
            { date: "2030-01-09", amount: 16.75 },
            { date: "2030-07-09", amount: 16.75 },
        ]
    },
    "GD30": {
        name: "GD30 - Ley NY 2030",
        residualValue: 84.0,
        flows: [
            { date: "2026-07-09", amount: 4.375 },
            { date: "2027-01-09", amount: 4.375 },
            { date: "2027-07-09", amount: 4.375 },
            { date: "2028-01-09", amount: 16.75 },
            { date: "2028-07-09", amount: 16.75 },
            { date: "2029-01-09", amount: 16.75 },
            { date: "2029-07-09", amount: 16.75 },
            { date: "2030-01-09", amount: 16.75 },
            { date: "2030-07-09", amount: 16.75 },
        ]
    },
    "AL29": {
        name: "AL29 - Ley Argentina 2029",
        residualValue: 80.0,
        flows: [
            { date: "2026-07-09", amount: 10.50 },
            { date: "2027-01-09", amount: 10.50 },
            { date: "2027-07-09", amount: 10.50 },
            { date: "2028-01-09", amount: 10.50 },
            { date: "2028-07-09", amount: 10.50 },
            { date: "2029-01-09", amount: 10.50 },
            { date: "2029-07-09", amount: 10.50 },
        ]
    }
};

/**
 * Get TIR and Paridad based on current market price
 */
export function calculateBondMetrics(ticker, currentPrice) {
    const bond = BOND_DATA[ticker];
    if (!bond || currentPrice <= 0) return { tir: 0, paridad: 0 };

    const today = new Date();
    
    // Filter out past cash flows
    const futureFlows = bond.flows
        .map(f => ({ date: new Date(f.date), amount: f.amount }))
        .filter(f => f.date > today);

    // XIRR needs the current price as a negative cash flow at T=0
    const xirrFlows = [
        { date: today, amount: -currentPrice },
        ...futureFlows
    ];

    let tir = 0;
    try {
        tir = calculateXIRR(xirrFlows, 0.15) * 100; // Convert to percentage
    } catch(e) {
        tir = 0;
    }

    const paridad = (currentPrice / bond.residualValue) * 100;

    return {
        tir: tir.toFixed(2),
        paridad: paridad.toFixed(2)
    };
}
