/**
 * Idiomas que habla el sitio.
 *
 * El español es el idioma por defecto y vive en la raíz (`/`, `/privacidad`)
 * para no mover las URLs que Google ya tiene indexadas. El inglés vive bajo
 * `/en` con sus propios slugs traducidos, que es lo que posiciona en búsquedas
 * de Estados Unidos.
 */

export const IDIOMAS = ["es", "en"] as const;

export type Idioma = (typeof IDIOMAS)[number];

export const IDIOMA_POR_DEFECTO: Idioma = "es";

/** Cómo se llama cada idioma en su propio idioma, para el selector. */
export const NOMBRE_IDIOMA: Record<Idioma, string> = {
  es: "Español",
  en: "English",
};

/** Versión corta del nombre, para cuando no cabe el completo (móvil). */
export const CODIGO_IDIOMA: Record<Idioma, string> = {
  es: "ES",
  en: "EN",
};

/** Valor del atributo `lang` del `<html>`. */
export const LANG_HTML: Record<Idioma, string> = {
  es: "es",
  en: "en-US",
};

/** Locale con guion bajo que pide Open Graph. */
export const LOCALE_OG: Record<Idioma, string> = {
  es: "es_HN",
  en: "en_US",
};

/** Etiqueta hreflang. `es` a secas para no encasillar el español en un país. */
export const HREFLANG: Record<Idioma, string> = {
  es: "es",
  en: "en-US",
};

/**
 * Locale con el que se formatean los montos en cada idioma.
 *
 * En español se deja `undefined` para que cada moneda use el suyo (`es-HN`
 * para el lempira, `es-MX` para el peso). En inglés se fuerza `en-US`, si no
 * los dólares saldrían como "USD 1,250.50" en vez de "$1,250.50".
 */
export const LOCALE_MONEDA: Record<Idioma, string | undefined> = {
  es: undefined,
  en: "en-US",
};

export function esIdioma(valor: string | undefined | null): valor is Idioma {
  return valor != null && (IDIOMAS as readonly string[]).includes(valor);
}

/** Lo que se antepone a las rutas. El idioma por defecto no lleva prefijo. */
export function prefijo(idioma: Idioma): string {
  return idioma === IDIOMA_POR_DEFECTO ? "" : `/${idioma}`;
}

/**
 * Idioma de una ruta según su primer segmento.
 * `/en/split-trip-expenses` -> "en"; cualquier otra cosa -> "es".
 */
export function idiomaDeRuta(pathname: string): Idioma {
  const segmento = pathname.split("/")[1];
  return esIdioma(segmento) && segmento !== IDIOMA_POR_DEFECTO ? segmento : IDIOMA_POR_DEFECTO;
}

/**
 * El idioma que prefiere el navegador, de su cabecera `Accept-Language`.
 *
 * Solo se usa para *sugerir* el cambio, nunca para redirigir automáticamente:
 * un redirect por cabecera confunde a Googlebot (que rastrea desde Estados
 * Unidos) y terminaría sacando la portada en español del índice.
 */
export function idiomaPreferido(acceptLanguage: string | null): Idioma {
  if (!acceptLanguage) return IDIOMA_POR_DEFECTO;

  const preferencias = acceptLanguage
    .split(",")
    .map((parte) => {
      const [etiqueta, ...parametros] = parte.trim().split(";");
      const q = parametros.find((p) => p.trim().startsWith("q="));
      return {
        idioma: etiqueta.trim().toLowerCase().split("-")[0],
        peso: q ? Number(q.split("=")[1]) || 0 : 1,
      };
    })
    .sort((a, b) => b.peso - a.peso);

  const encontrado = preferencias.find((p) => esIdioma(p.idioma));
  return encontrado ? (encontrado.idioma as Idioma) : IDIOMA_POR_DEFECTO;
}
