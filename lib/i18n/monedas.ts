import { getMoneda } from "@/lib/split/moneda";
import { type Idioma } from "./idiomas";

/**
 * Nombre de cada moneda en inglés.
 *
 * Vive aquí y no en `lib/split/moneda.ts` porque el catálogo es dominio puro
 * —códigos, decimales, factores— y no tiene por qué saber en qué idioma se
 * está pintando la pantalla. Lo que falte cae al nombre en español, que para
 * "Euro", "Quetzal" o "Real" es exactamente el mismo.
 */
const EN: Record<string, string> = {
  HNL: "Honduran Lempira",
  MXN: "Mexican Peso",
  GTQ: "Guatemalan Quetzal",
  CRC: "Costa Rican Colón",
  NIO: "Nicaraguan Córdoba",
  PAB: "Panamanian Balboa",
  DOP: "Dominican Peso",
  COP: "Colombian Peso",
  PEN: "Peruvian Sol",
  CLP: "Chilean Peso",
  ARS: "Argentine Peso",
  UYU: "Uruguayan Peso",
  PYG: "Paraguayan Guaraní",
  BOB: "Bolivian Boliviano",
  BRL: "Brazilian Real",
  VES: "Venezuelan Bolívar",
  USD: "US Dollar",
  EUR: "Euro",
};

/** Nombre de una moneda en el idioma de la interfaz. */
export function nombreMoneda(codigo: string, idioma: Idioma): string {
  const moneda = getMoneda(codigo);
  return idioma === "en" ? (EN[moneda.codigo] ?? moneda.nombre) : moneda.nombre;
}

/** Etiqueta del selector: `USD · US Dollar`. */
export function etiquetaMoneda(codigo: string, idioma: Idioma): string {
  const moneda = getMoneda(codigo);
  return `${moneda.codigo} · ${nombreMoneda(moneda.codigo, idioma)}`;
}
