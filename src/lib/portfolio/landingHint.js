// Aviso en el navegador de que el usuario ya cargó su cartera. El script del layout lo lee antes de pintar
// y marca <html data-cartera="activa">: así /Cartera abre directo en el tablero, sin la presentación.

export const CARTERA_ACTIVA_KEY = 'infopeso_cartera_activa';

export const carteraActivaScript = `if (localStorage.getItem('${CARTERA_ACTIVA_KEY}') === '1') document.documentElement.setAttribute('data-cartera', 'activa');`;

export function rememberPortfolio(hasPositions) {
    // También en esta visita: si la cartera llega de la cuenta (otro dispositivo), la presentación se oculta ya.
    if (hasPositions) document.documentElement.setAttribute('data-cartera', 'activa');
    else document.documentElement.removeAttribute('data-cartera');
    try {
        if (hasPositions) localStorage.setItem(CARTERA_ACTIVA_KEY, '1');
        else localStorage.removeItem(CARTERA_ACTIVA_KEY);
    } catch {
        // sin acceso a localStorage: se sigue mostrando la presentación
    }
}
