export const SITE_URL = 'https://www.infopeso.com.ar';

export function absoluteUrl(path = '/') {
    return new URL(path, SITE_URL).toString();
}

// Serializa JSON-LD escapando "<" para evitar inyección de </script>
export function jsonLd(obj) {
    return JSON.stringify(obj).replace(/</g, '\u003c');
}
