import { IDIOMA_POR_DEFECTO, IDIOMAS, type Idioma } from "./idiomas";

/**
 * Mapa de rutas por idioma.
 *
 * Cada página pública tiene una clave estable y un slug distinto por idioma.
 * Los slugs en inglés NO son la traducción literal del español: son la frase
 * que de verdad se busca en Estados Unidos ("split restaurant bill", no
 * "divide-the-restaurant-check").
 *
 * Todo lo que enlaza entre páginas —header, footer, sitemap, hreflang, el
 * selector de idioma— sale de aquí, así no hay forma de que se desincronicen.
 */
export const RUTAS = {
  inicio: { es: "/", en: "/en" },

  // Contenido: lo que trae tráfico de búsqueda.
  viaje: { es: "/dividir-gastos-de-viaje", en: "/en/split-trip-expenses" },
  despensa: { es: "/dividir-la-despensa", en: "/en/split-grocery-bill" },
  restaurante: { es: "/dividir-la-cuenta-del-restaurante", en: "/en/split-restaurant-bill" },
  roommates: { es: "/gastos-entre-roommates", en: "/en/roommate-expenses" },

  // Sesión.
  login: { es: "/login", en: "/en/login" },
  registro: { es: "/registro", en: "/en/signup" },
  unirse: { es: "/unirse", en: "/en/join" },
  olvide: { es: "/forgot-password", en: "/en/forgot-password" },
  restablecer: { es: "/reset-password", en: "/en/reset-password" },

  // Legales.
  privacidad: { es: "/privacidad", en: "/en/privacy" },
  terminos: { es: "/terminos", en: "/en/terms" },
  contacto: { es: "/contacto", en: "/en/contact" },
} as const satisfies Record<string, Record<Idioma, string>>;

export type ClaveRuta = keyof typeof RUTAS;

/** Las claves de los casos de uso, en el orden en que se listan. */
export const CLAVES_CASOS_DE_USO = [
  "viaje",
  "despensa",
  "restaurante",
  "roommates",
] as const satisfies readonly ClaveRuta[];

export const CLAVES_LEGALES = [
  "privacidad",
  "terminos",
  "contacto",
] as const satisfies readonly ClaveRuta[];

/**
 * Las páginas que tienen entrada propia en el diccionario (`paginas.*`): las
 * de contenido y las legales. La portada y las de sesión traen su texto de su
 * propia sección, así que quedan fuera.
 */
export type ClavePagina =
  | (typeof CLAVES_CASOS_DE_USO)[number]
  | (typeof CLAVES_LEGALES)[number];

/** La ruta de una página en un idioma. `ruta("viaje", "en")` -> `/en/split-trip-expenses`. */
export function ruta(clave: ClaveRuta, idioma: Idioma): string {
  return RUTAS[clave][idioma];
}

/**
 * Qué página es un pathname, y qué le sobra después del slug.
 *
 * El sobrante importa para las rutas con segmento dinámico: `/unirse/K7M2QPXY`
 * resuelve a la clave `unirse` con resto `/K7M2QPXY`, y así el selector de
 * idioma puede llevarte a `/en/join/K7M2QPXY` sin perder el código.
 */
export function resolverRuta(
  pathname: string
): { clave: ClaveRuta; idioma: Idioma; resto: string } | null {
  const limpio = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  let mejor: { clave: ClaveRuta; idioma: Idioma; resto: string } | null = null;

  for (const clave of Object.keys(RUTAS) as ClaveRuta[]) {
    for (const idioma of IDIOMAS) {
      const slug = RUTAS[clave][idioma];

      const exacta = limpio === slug;
      const conResto = slug !== "/" && slug !== "/en" && limpio.startsWith(`${slug}/`);
      if (!exacta && !conResto) continue;

      // Gana el slug más largo: `/en/join/ABC` es `unirse` en inglés, no
      // `inicio` en inglés con resto.
      if (mejor && RUTAS[mejor.clave][mejor.idioma].length >= slug.length) continue;

      mejor = { clave, idioma, resto: exacta ? "" : limpio.slice(slug.length) };
    }
  }

  return mejor;
}

/**
 * La misma página en el otro idioma. Si la ruta no está en el mapa (una
 * pantalla privada, un 404), manda a la portada del idioma destino.
 */
export function rutaEquivalente(pathname: string, destino: Idioma): string {
  const actual = resolverRuta(pathname);
  if (!actual) return RUTAS.inicio[destino];

  return `${RUTAS[actual.clave][destino]}${actual.resto}`;
}

/** Las dos versiones de una página, para el `hreflang` y el sitemap. */
export function versiones(clave: ClaveRuta): Record<Idioma, string> {
  return RUTAS[clave];
}

/**
 * Bloque `alternates` de los metadatos: canonical de esta versión más los
 * hreflang de todas. `x-default` apunta al español, que es la versión original.
 */
export function alternatesDe(clave: ClaveRuta, idioma: Idioma) {
  return {
    canonical: RUTAS[clave][idioma],
    languages: {
      es: RUTAS[clave].es,
      "en-US": RUTAS[clave].en,
      "x-default": RUTAS[clave][IDIOMA_POR_DEFECTO],
    },
  };
}
