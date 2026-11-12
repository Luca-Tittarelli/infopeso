#!/usr/bin/env node
// Trae los datos del día de las mismas fuentes que usa infopeso.com.ar y los imprime en formato es-AR.
// Uso: node herramientas/datos.mjs [--json]
// Requiere Node 18+ (fetch nativo). No necesita claves.

const FUENTES = {
  dolares: "https://dolarapi.com/v1/dolares",
  riesgoPais: "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo",
  inflacion: "https://api.argentinadatos.com/v1/finanzas/indices/inflacion",
};

async function traer(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "infopeso-marketing" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true, data: await res.json() };
  } catch (err) {
    return { ok: false, error: `${url}: ${err.message}` };
  }
}

const num = (v, dec = 2) =>
  new Intl.NumberFormat("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);
const pesos = (v) => (v == null ? "—" : `$ ${num(v, v % 1 === 0 ? 0 : 2)}`);
const pct = (v) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${num(Math.abs(v), 1)} %`);
const hora = (iso) =>
  iso
    ? new Intl.DateTimeFormat("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(new Date(iso))
    : "—";

const [dolares, riesgo, inflacion] = await Promise.all(Object.values(FUENTES).map(traer));

const porCasa = Object.fromEntries((dolares.ok ? dolares.data : []).map((d) => [d.casa, d]));
const oficial = porCasa.oficial?.venta;
const brecha = (v) => (v && oficial ? (v / oficial - 1) * 100 : null);

const ultimaInflacion = inflacion.ok ? inflacion.data.at(-1) : null;
const interanual =
  inflacion.ok && inflacion.data.length >= 12
    ? (inflacion.data.slice(-12).reduce((acc, m) => acc * (1 + m.valor / 100), 1) - 1) * 100
    : null;

const salida = {
  generado: new Date().toISOString(),
  dolares: Object.values(porCasa).map((d) => ({
    casa: d.casa,
    nombre: d.nombre,
    compra: d.compra,
    venta: d.venta,
    brechaVsOficial: d.casa === "oficial" ? null : brecha(d.venta),
    actualizado: d.fechaActualizacion,
  })),
  riesgoPais: riesgo.ok ? { puntos: riesgo.data.valor, fecha: riesgo.data.fecha } : null,
  inflacion: ultimaInflacion
    ? { mes: ultimaInflacion.fecha, mensual: ultimaInflacion.valor, interanualAprox: interanual }
    : null,
  fuentes: {
    dolares: "DolarAPI",
    riesgoPais: "ArgentinaDatos",
    inflacion: "INDEC vía ArgentinaDatos",
  },
  errores: [dolares, riesgo, inflacion].filter((r) => !r.ok).map((r) => r.error),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(salida, null, 2));
} else {
  console.log("DÓLAR (venta · brecha vs oficial · actualizado)  — Fuente: DolarAPI");
  for (const d of salida.dolares) {
    console.log(
      `  ${d.nombre.padEnd(24)} ${pesos(d.venta).padStart(12)}   ${d.brechaVsOficial == null ? "".padStart(8) : pct(d.brechaVsOficial).padStart(8)}   ${hora(d.actualizado)}`,
    );
  }
  if (salida.riesgoPais)
    console.log(`\nRIESGO PAÍS  ${num(salida.riesgoPais.puntos, 0)} pb  (${salida.riesgoPais.fecha}) — Fuente: ArgentinaDatos`);
  if (salida.inflacion)
    console.log(
      `INFLACIÓN    ${num(salida.inflacion.mensual, 1)} % mensual (${salida.inflacion.mes.slice(0, 7)}) · ~${num(salida.inflacion.interanualAprox, 1)} % últimos 12 meses — Fuente: INDEC`,
    );
  if (salida.errores.length) console.log(`\n⚠ Fuentes con error: ${salida.errores.join(" | ")}`);
}
