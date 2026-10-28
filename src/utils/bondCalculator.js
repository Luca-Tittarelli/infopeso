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
 * Flujos pendientes por cada 100 VN (interés + amortización), en USD.
 * Fuente: cronograma de pagos publicado por Rava (flujo actualizado al 27/10/2026), consistente con las
 * condiciones de emisión (Res. 381/2020): AL30/GD30 amortizan en 13 cuotas (4% y luego 8%) con cupón escalonado
 * (0,75% hasta jul-2027, 1,75% después); AL29 amortiza en 10 cuotas de 10% con cupón de 1%.
 * Revisar cada vez que se paga un cupón: se eliminan solos los flujos con fecha pasada, pero residualValue es manual.
 */
export const BOND_DATA = {
    "AL30": {
        name: "AL30 - Ley Argentina 2030",
        fullName: "Bonar 2030",
        law: "Ley argentina",
        maturity: "2030-07-09",
        residualValue: 64.0, // valor residual después del pago de julio de 2026
        flows: [
            { date: "2027-01-11", amount: 8.24 },
            { date: "2027-07-12", amount: 8.21 },
            { date: "2028-01-10", amount: 8.42 },
            { date: "2028-07-10", amount: 8.35 },
            { date: "2029-01-09", amount: 8.28 },
            { date: "2029-07-10", amount: 8.21 },
            { date: "2030-01-09", amount: 8.14 },
            { date: "2030-07-10", amount: 8.07 },
        ]
    },
    "GD30": {
        name: "GD30 - Ley NY 2030",
        fullName: "Global 2030",
        law: "Ley Nueva York",
        maturity: "2030-07-09",
        residualValue: 64.0,
        flows: [
            { date: "2027-01-11", amount: 8.24 },
            { date: "2027-07-12", amount: 8.21 },
            { date: "2028-01-10", amount: 8.42 },
            { date: "2028-07-10", amount: 8.35 },
            { date: "2029-01-09", amount: 8.28 },
            { date: "2029-07-10", amount: 8.21 },
            { date: "2030-01-09", amount: 8.14 },
            { date: "2030-07-10", amount: 8.07 },
        ]
    },
    "AL29": {
        name: "AL29 - Ley Argentina 2029",
        fullName: "Bonar 2029",
        law: "Ley argentina",
        maturity: "2029-07-09",
        residualValue: 60.0,
        flows: [
            { date: "2027-01-11", amount: 10.30 },
            { date: "2027-07-12", amount: 10.25 },
            { date: "2028-01-10", amount: 10.20 },
            { date: "2028-07-10", amount: 10.15 },
            { date: "2029-01-09", amount: 10.10 },
            { date: "2029-07-10", amount: 10.05 },
        ]
    }
};

/**
 * Próximo pago pendiente de un bono (fecha y monto por 100 VN) o null si no quedan flujos
 */
export function getNextPayment(ticker, from = new Date()) {
    const bond = BOND_DATA[ticker];
    if (!bond) return null;
    const next = bond.flows.find((f) => new Date(f.date) > from);
    return next || null;
}

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
