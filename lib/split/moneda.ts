/**
 * Catálogo de monedas y utilidades de formato.
 *
 * Todos los montos del sistema se manejan como enteros en la **unidad menor**
 * de la moneda (convención de Stripe). Para HNL/MXN eso son centavos; para COP,
 * CLP y PYG —que no usan decimales— la unidad menor es la moneda misma.
 * Guardarlo así hace que las divisiones sean exactas y siempre pagables.
 */

export type Moneda = {
  codigo: string;
  nombre: string;
  simbolo: string;
  /** Decimales de la moneda. Define el factor: 10^decimales */
  decimales: number;
  locale: string;
  pais: string;
};

export const MONEDAS: readonly Moneda[] = [
  { codigo: "HNL", nombre: "Lempira", simbolo: "L", decimales: 2, locale: "es-HN", pais: "Honduras" },
  { codigo: "MXN", nombre: "Peso mexicano", simbolo: "$", decimales: 2, locale: "es-MX", pais: "México" },
  { codigo: "GTQ", nombre: "Quetzal", simbolo: "Q", decimales: 2, locale: "es-GT", pais: "Guatemala" },
  { codigo: "CRC", nombre: "Colón", simbolo: "₡", decimales: 2, locale: "es-CR", pais: "Costa Rica" },
  { codigo: "NIO", nombre: "Córdoba", simbolo: "C$", decimales: 2, locale: "es-NI", pais: "Nicaragua" },
  { codigo: "PAB", nombre: "Balboa", simbolo: "B/.", decimales: 2, locale: "es-PA", pais: "Panamá" },
  { codigo: "DOP", nombre: "Peso dominicano", simbolo: "RD$", decimales: 2, locale: "es-DO", pais: "República Dominicana" },
  { codigo: "COP", nombre: "Peso colombiano", simbolo: "$", decimales: 0, locale: "es-CO", pais: "Colombia" },
  { codigo: "PEN", nombre: "Sol", simbolo: "S/", decimales: 2, locale: "es-PE", pais: "Perú" },
  { codigo: "CLP", nombre: "Peso chileno", simbolo: "$", decimales: 0, locale: "es-CL", pais: "Chile" },
  { codigo: "ARS", nombre: "Peso argentino", simbolo: "$", decimales: 2, locale: "es-AR", pais: "Argentina" },
  { codigo: "UYU", nombre: "Peso uruguayo", simbolo: "$U", decimales: 2, locale: "es-UY", pais: "Uruguay" },
  { codigo: "PYG", nombre: "Guaraní", simbolo: "₲", decimales: 0, locale: "es-PY", pais: "Paraguay" },
  { codigo: "BOB", nombre: "Boliviano", simbolo: "Bs", decimales: 2, locale: "es-BO", pais: "Bolivia" },
  { codigo: "BRL", nombre: "Real", simbolo: "R$", decimales: 2, locale: "pt-BR", pais: "Brasil" },
  { codigo: "VES", nombre: "Bolívar", simbolo: "Bs.", decimales: 2, locale: "es-VE", pais: "Venezuela" },
  { codigo: "USD", nombre: "Dólar", simbolo: "$", decimales: 2, locale: "es-419", pais: "Internacional" },
  { codigo: "EUR", nombre: "Euro", simbolo: "€", decimales: 2, locale: "es-ES", pais: "Zona euro" },
] as const;

export const MONEDA_POR_DEFECTO = "USD";

const PORCODIGO = new Map(MONEDAS.map((m) => [m.codigo, m]));

export function getMoneda(codigo: string): Moneda {
  return PORCODIGO.get(codigo.toUpperCase()) ?? PORCODIGO.get(MONEDA_POR_DEFECTO)!;
}

export function esMonedaValida(codigo: string): boolean {
  return PORCODIGO.has(codigo.toUpperCase());
}

/** Factor de conversión entre unidad mayor y menor. HNL -> 100, COP -> 1 */
export function factor(codigo: string): number {
  return 10 ** getMoneda(codigo).decimales;
}

/**
 * Texto a unidad menor. "1,250.50" y "1.250,50" -> 125050 (HNL).
 *
 * Un grupo de exactamente 3 dígitos tras el último separador se lee
 * como separador de miles, no como decimales: en LATAM "50.000" son
 * cincuenta mil. Devuelve null si no es un número válido.
 */
export function aUnidadMenor(valor: string | number, codigo: string): number | null {
  const { decimales } = getMoneda(codigo);

  if (typeof valor === "number") {
    return Number.isFinite(valor) ? Math.round(valor * 10 ** decimales) : null;
  }

  const texto = valor.trim();
  if (!texto) return null;

  const negativo = texto.startsWith("-");
  const crudo = texto.replace(/[^\d.,]/g, "");
  if (!crudo) return null;

  const ultimoSeparador = Math.max(crudo.lastIndexOf(","), crudo.lastIndexOf("."));
  let entero: string;
  let fraccion: string;

  if (ultimoSeparador === -1) {
    entero = crudo;
    fraccion = "";
  } else if (crudo.length - ultimoSeparador - 1 === 3) {
    // "50.000" / "1,250" -> miles
    entero = crudo.replace(/[.,]/g, "");
    fraccion = "";
  } else {
    entero = crudo.slice(0, ultimoSeparador).replace(/[.,]/g, "");
    fraccion = crudo.slice(ultimoSeparador + 1).replace(/[.,]/g, "");
  }

  const numero = Number(`${entero || "0"}.${fraccion || "0"}`);
  if (!Number.isFinite(numero)) return null;

  const menor = Math.round(numero * 10 ** decimales);
  return negativo ? -menor : menor;
}

/** 125050 -> 1250.5 */
export function aUnidadMayor(montoMenor: number, codigo: string): number {
  return montoMenor / factor(codigo);
}

/**
 * 125050 -> "L 1,250.50"
 *
 * @param localeUi Locale con el que formatear, cuando la interfaz no está en
 * el idioma del catálogo. Sin él, USD sale como "USD 1,250.50" (es-419);
 * con "en-US" sale como "$1,250.50", que es lo que espera quien lee la
 * versión en inglés. Las monedas locales se ven igual con ambos.
 */
export function formatearMonto(
  montoMenor: number,
  codigo: string,
  localeUi?: string
): string {
  const moneda = getMoneda(codigo);

  try {
    return new Intl.NumberFormat(localeUi ?? moneda.locale, {
      style: "currency",
      currency: moneda.codigo,
      minimumFractionDigits: moneda.decimales,
      maximumFractionDigits: moneda.decimales,
    }).format(aUnidadMayor(montoMenor, codigo));
  } catch {
    return `${moneda.simbolo} ${aUnidadMayor(montoMenor, codigo).toFixed(moneda.decimales)}`;
  }
}

/** Solo el número, sin símbolo. Útil para inputs. */
export function formatearNumero(montoMenor: number, codigo: string): string {
  const moneda = getMoneda(codigo);
  return aUnidadMayor(montoMenor, codigo).toFixed(moneda.decimales);
}

/** Adivina la moneda a partir del locale del navegador. */
export function monedaSugerida(locale?: string): string {
  const idioma = locale ?? (typeof navigator !== "undefined" ? navigator.language : "");
  if (!idioma) return MONEDA_POR_DEFECTO;

  const region = idioma.split("-")[1]?.toUpperCase();
  if (!region) return MONEDA_POR_DEFECTO;

  const encontrada = MONEDAS.find((m) => m.locale.split("-")[1]?.toUpperCase() === region);
  return encontrada?.codigo ?? MONEDA_POR_DEFECTO;
}
