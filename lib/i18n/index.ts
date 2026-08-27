import en from "./diccionarios/en";
import es from "./diccionarios/es";
import { IDIOMA_POR_DEFECTO, type Idioma } from "./idiomas";
import type { Diccionario } from "./tipos";

export const DICCIONARIOS: Record<Idioma, Diccionario> = { es, en };

/** El diccionario de un idioma. Cae al español si le llega cualquier otra cosa. */
export function diccionario(idioma: Idioma | string | undefined): Diccionario {
  return DICCIONARIOS[idioma as Idioma] ?? DICCIONARIOS[IDIOMA_POR_DEFECTO];
}

export type { Diccionario };
export * from "./idiomas";
export * from "./rutas";
