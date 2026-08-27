import { headers } from "next/headers";

import { diccionario } from "./index";
import { IDIOMA_POR_DEFECTO, esIdioma, type Idioma } from "./idiomas";

/**
 * Idioma de la petición actual.
 *
 * Lo resuelve `proxy.ts` a partir del primer segmento de la URL y lo deja en
 * la cabecera `x-idioma`. Leerlo de ahí en vez de recibirlo por props sirve
 * igual en páginas, layouts y server actions, que es donde hacen falta los
 * textos.
 */
export async function getIdioma(): Promise<Idioma> {
  const valor = (await headers()).get("x-idioma");
  return esIdioma(valor) ? valor : IDIOMA_POR_DEFECTO;
}

/** El diccionario de la petición actual. */
export async function getDiccionario() {
  return diccionario(await getIdioma());
}
